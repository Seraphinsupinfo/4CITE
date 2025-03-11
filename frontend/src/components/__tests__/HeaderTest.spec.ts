// @ts-nocheck

import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/stores/UserStore';
import router from '@/router';
import WebsiteHeader from "@/components/WebsiteHeader.vue";

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true), // Ajout pour éviter les erreurs de navigation
  }
}));

describe('WebsiteHeader.vue', () => {
  let wrapper: ReturnType<typeof mount>;
  let userStore: ReturnType<typeof useUserStore>;

  beforeEach(async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });

    wrapper = mount(WebsiteHeader, {
      global: {
        plugins: [pinia, router],
      },
    });

    userStore = useUserStore();
    await router.isReady();
  });

  it("affiche le bouton de connexion lorsque l'utilisateur est déconnecté", () => {
    userStore.isLoggedIn = false;
    expect(wrapper.find('a.btn-primary').exists()).toBe(true);
  });

  it('affiche les liens appropriés pour un utilisateur connecté', async () => {
    userStore.isLoggedIn = true;
    userStore.user = { role: 'user' };
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Réservations');
    expect(wrapper.text()).toContain('Mon compte');
  });

  it("affiche le lien d'administration uniquement pour un admin", async () => {
    userStore.isLoggedIn = true;
    userStore.user = { role: 'admin' };
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Administration');
  });

  it("redirige vers la page de connexion lorsque l'utilisateur clique sur Se connecter", async () => {
    userStore.isLoggedIn = false;
    await wrapper.vm.$nextTick();

    await wrapper.find('a.btn-primary').trigger('click');
    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it("redirige vers la page des hôtels lorsqu'on clique sur le lien", async () => {
    await wrapper.find('.navbar-text.interactive').trigger('click');
    expect(router.push).toHaveBeenCalledWith('/hotels');
  });
});
