// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory, useRouter } from 'vue-router';
import LoginView from '../LoginView.vue';
import { useAuthStore } from '@/stores/AuthStore.ts';
import { useUserStore } from '@/stores/UserStore.ts';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn()
    }))
  };
});

vi.mock('@/stores/AuthStore.ts', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn()
  }))
}));

vi.mock('@/stores/UserStore.ts', () => ({
  useUserStore: vi.fn(() => ({
    fetchUserFromToken: vi.fn()
  }))
}));

describe('LoginView.vue', () => {
  let wrapper;
  let router;
  const mockRouter = {
    push: vi.fn()
  };
  const mockAuthStore = {
    login: vi.fn()
  };
  const mockUserStore = {
    fetchUserFromToken: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore);
    vi.mocked(useUserStore).mockReturnValue(mockUserStore);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/register', name: 'Register', component: { template: '<div>Register</div>' } }
      ]
    });

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true
        }
      }
    });
  });

  it('devrait afficher le titre correct', () => {
    const title = wrapper.find('h2.fw-bold');
    expect(title.exists()).toBeTruthy();
    expect(title.text()).toBe('Bon retour parmi nous !');
  });

  it('devrait avoir des champs pour l\'email et le mot de passe', () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    expect(emailInput.exists()).toBeTruthy();
    expect(emailInput.attributes('placeholder')).toBe('Adresse email');

    expect(passwordInput.exists()).toBeTruthy();
    expect(passwordInput.attributes('placeholder')).toBe('Mot de passe');
  });

  it('devrait avoir un bouton de connexion', () => {
    const loginButton = wrapper.find('button[type="submit"]');

    expect(loginButton.exists()).toBeTruthy();
    expect(loginButton.text()).toBe('Se connecter');
    expect(loginButton.classes()).toContain('btn-primary');
  });

  it('devrait afficher un message d\'erreur si les champs sont vides', async () => {
    const form = wrapper.find('form');

    await form.trigger('submit');
    await flushPromises();

    const errorMessage = wrapper.find('p.text-danger');
    expect(errorMessage.exists()).toBeTruthy();
    expect(errorMessage.text()).toBe('Veuillez remplir tous les champs.');

    expect(mockAuthStore.login).not.toHaveBeenCalled();
  });

  it('devrait appeler la méthode login du store lors de la soumission du formulaire', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    mockAuthStore.login.mockResolvedValue(true);

    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();

    expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockUserStore.fetchUserFromToken).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('devrait afficher un message d\'erreur si le login échoue', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('wrongpassword');

    mockAuthStore.login.mockResolvedValue(false);

    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();

    const errorMessage = wrapper.find('p.text-danger');
    expect(errorMessage.exists()).toBeTruthy();
    expect(errorMessage.text()).toBe('Email ou mot de passe incorrect.');

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('devrait mettre à jour les valeurs des champs lors de la saisie', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue('new@example.com');
    await passwordInput.setValue('newpassword');

    expect(wrapper.vm.email).toBe('new@example.com');
    expect(wrapper.vm.password).toBe('newpassword');
  });

  it('devrait contenir l\'icône de personne dans le design', () => {
    const personIcon = wrapper.find('svg.bi.bi-person');
    expect(personIcon.exists()).toBeTruthy();

    const iconContainer = wrapper.find('.bs-icon-xl.bs-icon-circle.bs-icon-primary');
    expect(iconContainer.exists()).toBeTruthy();
  });

  it('devrait avoir un lien "Mot de passe oublié"', () => {
    const forgotPasswordText = wrapper.findAll('p.text-muted').filter(p => p.text() === 'Mot de passe oublié ?');
    expect(forgotPasswordText.length).toBe(1);
  });

});
