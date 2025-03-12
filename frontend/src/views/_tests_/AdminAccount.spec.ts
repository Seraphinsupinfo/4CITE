// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/UserStore';
import api from '@/services/axiosConfig';
import AdminAccountView from '@/views/AdminAccountView.vue';

vi.mock('@/services/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: {} }
  ]
});

describe('AdminAccountView', () => {
  let wrapper;
  let userStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    userStore = useUserStore();

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');

    vi.spyOn(router, 'push');

    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirige vers la page d\'accueil si l\'utilisateur n\'est pas un admin', async () => {
    userStore.user = {
      id: 2,
      email: 'user@example.com',
      pseudo: 'regularuser',
      role: 'user'
    };

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await flushPromises();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('redirige vers la page d\'accueil si l\'utilisateur n\'est pas connecté', async () => {
    userStore.user = null;

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await flushPromises();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('affiche correctement les champs de recherche', async () => {
    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    expect(wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Rechercher');
  });

  it('n\'affiche pas les détails de l\'utilisateur avant la recherche', async () => {
    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    expect(wrapper.find('.card').exists()).toBe(false);
  });

  it('appelle l\'API avec l\'ID correct lors de la recherche d\'utilisateur', async () => {
    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');

    expect(api.get).toHaveBeenCalledWith('/users/123', {
      headers: { Authorization: 'Bearer fake-token' }
    });
  });

  it('affiche un message d\'erreur lorsque l\'utilisateur n\'est pas trouvé', async () => {
    api.get.mockResolvedValue({
      data: null
    });

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('999');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Utilisateur non trouvé.');
  });

  it('affiche un message d\'erreur si l\'API renvoie une erreur lors de la recherche', async () => {
    api.get.mockRejectedValue(new Error('API Error'));

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Erreur lors de la recherche de l\'utilisateur.');
  });

  it('affiche un message d\'erreur si la mise à jour des informations échoue', async () => {
    api.get.mockResolvedValue({
      data: {
        email: 'user@example.com',
        pseudo: 'testuser'
      }
    });

    api.put.mockRejectedValue({
      response: {
        data: {
          message: 'Email déjà utilisé'
        }
      }
    });

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.findAll('button')[1].trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Échec de la mise à jour. Email déjà utilisé');
  });

  it('vérifie que les mots de passe correspondent avant la mise à jour', async () => {
    api.get.mockResolvedValue({
      data: {
        email: 'user@example.com',
        pseudo: 'testuser'
      }
    });

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.find('input[placeholder="Nouveau mot de passe"]').setValue('password123');
    await wrapper.find('input[placeholder="Confirmer"]').setValue('differentpassword');

    await wrapper.findAll('button')[2].trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Les mots de passe ne correspondent pas.');
    expect(api.put).not.toHaveBeenCalled();
  });

  it('permet de mettre à jour le mot de passe', async () => {
    api.get.mockResolvedValue({
      data: {
        email: 'user@example.com',
        pseudo: 'testuser'
      }
    });

    api.put.mockResolvedValue({});

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.find('input[placeholder="Nouveau mot de passe"]').setValue('newpassword123');
    await wrapper.find('input[placeholder="Confirmer"]').setValue('newpassword123');

    await wrapper.findAll('button')[2].trigger('click');
    await flushPromises();

    expect(api.put).toHaveBeenCalledWith('/users/123/password', {
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: 'Bearer fake-token' }
    });

    expect(wrapper.find('.text-success').text()).toBe('Mot de passe mis à jour.');
  });

  it('affiche un message d\'erreur si la mise à jour du mot de passe échoue', async () => {
    api.get.mockResolvedValue({
      data: {
        email: 'user@example.com',
        pseudo: 'testuser'
      }
    });

    api.put.mockImplementation((url) => {
      if (url.includes('password')) {
        return Promise.reject(new Error('Password update failed'));
      }
      return Promise.resolve({});
    });

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.find('input[placeholder="Nouveau mot de passe"]').setValue('newpassword123');
    await wrapper.find('input[placeholder="Confirmer"]').setValue('newpassword123');

    await wrapper.findAll('button')[2].trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Échec de la mise à jour du mot de passe.');
  });

  it('réinitialise les messages d\'erreur et de succès avant une nouvelle recherche', async () => {
    api.get.mockResolvedValueOnce({
      data: null
    }).mockResolvedValueOnce({
      data: {
        email: 'user@example.com',
        pseudo: 'testuser'
      }
    });

    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('999');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').text()).toBe('Utilisateur non trouvé.');

    await wrapper.find('input[placeholder="Entrez un identifiant utilisateur"]').setValue('123');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.text-danger').exists()).toBe(false);
  });

  it('ne tente pas de mettre à jour les informations si aucun utilisateur n\'est trouvé', async () => {
    wrapper = mount(AdminAccountView, {
      global: {
        plugins: [router],
        provide: {
          userStore
        }
      }
    });

    const vm = wrapper.vm as any;
    await vm.updateInfo();

    expect(api.put).not.toHaveBeenCalled();
  });
});
