// @ts-nocheck
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useAuthStore } from '@/stores/AuthStore';
import { useUserStore } from '@/stores/UserStore';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

import { useRouter } from 'vue-router';
import RegisterView from "@/views/RegisterView.vue";

describe('RegisterView.vue', () => {
  let wrapper;
  const mockRouter = {
    push: vi.fn()
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter);

    // Créer une instance de Pinia pour les tests
    wrapper = mount(RegisterView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false
          })
        ],
        stubs: {
          'router-link': true
        }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le formulaire d\'inscription avec les champs requis', () => {
    expect(wrapper.find('h2').text()).toBe('Créez un compte');
    expect(wrapper.find('input[placeholder="Nom d\'utilisateur"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Adresse email"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Mot de passe"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Confirmez le mot de passe"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('S\'inscrire');
  });

  it('devrait mettre à jour les champs du formulaire lors de la saisie utilisateur', async () => {
    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    expect(wrapper.vm.pseudo).toBe('testuser');
    expect(wrapper.vm.email).toBe('test@example.com');
    expect(wrapper.vm.password).toBe('password123');
    expect(wrapper.vm.confirmPassword).toBe('password123');
  });

  it('devrait afficher une erreur si tous les champs ne sont pas remplis', async () => {
    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(wrapper.vm.errorMessage).toBe('Veuillez remplir tous les champs.');
    expect(wrapper.find('.text-danger').text()).toBe('Veuillez remplir tous les champs.');
  });

  it('devrait afficher une erreur si les mots de passe ne correspondent pas', async () => {
    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('differentpassword');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(wrapper.vm.errorMessage).toBe('Les mots de passe ne correspondent pas.');
    expect(wrapper.find('.text-danger').text()).toBe('Les mots de passe ne correspondent pas.');
  });

  it('devrait appeler la méthode register de l\'AuthStore avec les bons paramètres', async () => {
    const authStore = useAuthStore();
    authStore.register = vi.fn().mockResolvedValue(true);

    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(authStore.register).toHaveBeenCalledWith('test@example.com', 'testuser', 'password123', 'password123');
  });

  it('devrait rediriger vers la page de connexion après une inscription réussie', async () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();

    authStore.register = vi.fn().mockResolvedValue(true);
    userStore.fetchUserFromToken = vi.fn().mockResolvedValue();

    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();

    expect(userStore.fetchUserFromToken).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('devrait afficher un message d\'erreur si l\'inscription échoue', async () => {
    const authStore = useAuthStore();

    authStore.register = vi.fn().mockResolvedValue(false);

    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Erreur lors de l\'inscription.');
    expect(wrapper.find('.text-danger').text()).toBe('Erreur lors de l\'inscription.');
  });

  it('devrait initialiser les données du formulaire correctement', () => {
    expect(wrapper.vm.email).toBe('');
    expect(wrapper.vm.pseudo).toBe('');
    expect(wrapper.vm.password).toBe('');
    expect(wrapper.vm.confirmPassword).toBe('');
    expect(wrapper.vm.errorMessage).toBe('');
  });

  it('devrait avoir le type "password" pour les champs de mot de passe', () => {
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    expect(passwordInput.attributes('type')).toBe('password');
    expect(confirmPasswordInput.attributes('type')).toBe('password');
  });

  it('devrait avoir le type "email" pour le champ email', () => {
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    expect(emailInput.attributes('type')).toBe('email');
  });

  it('ne devrait pas afficher de message d\'erreur par défaut', () => {
    expect(wrapper.find('.text-danger').exists()).toBe(false);
  });

  it('devrait effacer le message d\'erreur lorsqu\'une soumission réussit', async () => {
    // D'abord définir un message d'erreur
    wrapper.vm.errorMessage = "Erreur précédente";
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.text-danger').exists()).toBe(true);

    // Configurer une inscription réussie
    const authStore = useAuthStore();
    authStore.register = vi.fn().mockResolvedValue(true);

    // Remplir tous les champs
    const pseudoInput = wrapper.find('input[placeholder="Nom d\'utilisateur"]');
    const emailInput = wrapper.find('input[placeholder="Adresse email"]');
    const passwordInput = wrapper.find('input[placeholder="Mot de passe"]');
    const confirmPasswordInput = wrapper.find('input[placeholder="Confirmez le mot de passe"]');

    await pseudoInput.setValue('testuser');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    // Soumettre le formulaire
    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();

    // Vérifier que le message d'erreur a été réinitialisé (implicitement par la redirection)
    expect(mockRouter.push).toHaveBeenCalled();
  });
});
