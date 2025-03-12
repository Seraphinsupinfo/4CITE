// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/UserStore';
import { useAuthStore } from '@/stores/AuthStore';
import api from '@/services/axiosConfig';
import AccountView from "@/views/AccountView.vue";

vi.mock('@/services/axiosConfig', () => ({
  default: {
    delete: vi.fn()
  }
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: {} },
    { path: '/profile', name: 'profile', component: {} }
  ]
});

describe('AccountView', () => {
  let wrapper;
  let userStore;
  let authStore;

  beforeEach(() => {
    vi.useFakeTimers();

    setActivePinia(createPinia());
    userStore = useUserStore();
    authStore = useAuthStore();

    userStore.updateUserData = vi.fn();
    authStore.logout = vi.fn();

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');

    vi.spyOn(router, 'push');

    userStore.user = {
      id: 1,
      email: 'test@example.com',
      pseudo: 'testuser'
    };
    userStore.isLoggedIn = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('affiche correctement les données utilisateur à l\'initialisation', async () => {
    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    expect(wrapper.find('input[type="email"]').element.value).toBe('test@example.com');
    expect(wrapper.find('input[placeholder="Pseudo"]').element.value).toBe('testuser');
  });

  it('redirige vers la page d\'accueil si l\'utilisateur n\'est pas connecté', async () => {
    userStore.isLoggedIn = false;

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await flushPromises();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('appelle updateUserData avec les bonnes valeurs lors de la soumission du formulaire', async () => {
    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    // Définir les valeurs du formulaire
    await wrapper.find('input[type="email"]').setValue('nouveau@example.com');
    await wrapper.find('input[placeholder="Pseudo"]').setValue('nouveaupseudo');
    await wrapper.find('input[placeholder="Mot de passe actuel"]').setValue('password123');
    await wrapper.find('input[placeholder="Nouveau mot de passe (optionnel)"]').setValue('newpassword123');
    await wrapper.find('input[placeholder="Confirmer (optionnel)"]').setValue('newpassword123');

    // Soumettre le formulaire
    await wrapper.find('form').trigger('submit');

    expect(userStore.updateUserData).toHaveBeenCalledWith(
      'nouveau@example.com',
      'nouveaupseudo',
      'password123',
      'newpassword123',
      'newpassword123'
    );
  });

  it('affiche un message de succès après la mise à jour réussie des données', async () => {
    userStore.updateUserData.mockResolvedValue();

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Mise à jour réussie.');
    expect(wrapper.find('.text-success').exists()).toBe(true);
  });

  it('affiche un message d\'erreur si la mise à jour échoue', async () => {
    const errorMessage = 'Mot de passe incorrect';
    userStore.updateUserData.mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain(`Échec de la mise à jour. ${errorMessage}`);
    expect(wrapper.find('.text-danger').exists()).toBe(true);
  });

  it('appelle la fonction de déconnexion et redirige vers la page d\'accueil', async () => {
    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('button.btn-danger').trigger('click');

    expect(authStore.logout).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Déconnexion réussie.');

    // Test de la redirection après le délai
    vi.runAllTimers();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('supprime le compte utilisateur avec succès et redirige', async () => {
    api.delete.mockResolvedValue({});

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('button.btn-outline-danger').trigger('click');
    await flushPromises();

    expect(api.delete).toHaveBeenCalledWith('users/1', {
      headers: {
        Authorization: 'Bearer fake-token'
      }
    });
    expect(authStore.logout).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Compte supprimé avec succès.');

    // Test de la redirection après le délai
    vi.runAllTimers();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('affiche un message d\'erreur si la suppression de compte échoue', async () => {
    api.delete.mockRejectedValue(new Error('Échec de la suppression'));

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('button.btn-outline-danger').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Échec de la suppression du compte.');
    expect(wrapper.find('.text-danger').exists()).toBe(true);
  });

  it('ne modifie pas le mot de passe si les champs sont vides', async () => {
    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[placeholder="Pseudo"]').setValue('testuser');
    await wrapper.find('input[placeholder="Mot de passe actuel"]').setValue('password123');
    // Ne pas remplir les champs de mot de passe

    await wrapper.find('form').trigger('submit');

    expect(userStore.updateUserData).toHaveBeenCalledWith(
      'test@example.com',
      'testuser',
      'password123',
      null,
      null
    );
  });

  it('vérifie que les champs sont correctement initialisés avec les valeurs par défaut', () => {
    userStore.user = null;

    wrapper = mount(AccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore,
          authStore
        }
      }
    });

    expect(wrapper.find('input[type="email"]').element.value).toBe('');
    expect(wrapper.find('input[placeholder="Pseudo"]').element.value).toBe('');
  });
});
