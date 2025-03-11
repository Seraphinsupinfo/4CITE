// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/UserStore';
import AdminView from '@/views/AdminView.vue';

const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

describe('AdminView.vue', () => {
  let wrapper;
  let userStore;

  beforeEach(() => {
    vi.clearAllMocks();

    setActivePinia(createPinia());
    userStore = useUserStore();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it("redirige vers l'accueil si l'utilisateur n'est pas un admin", async () => {
    userStore.user = {
      id: 1,
      email: 'user@example.com',
      pseudo: 'regularuser',
      role: 'user'
    };

    wrapper = mount(AdminView);

    await flushPromises();
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  it("n'effectue pas de redirection si l'utilisateur est admin", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };

    wrapper = mount(AdminView);

    await flushPromises();
    expect(mockRouterPush).not.toHaveBeenCalledWith('/');
  });

  it("affiche le panneau d'administration avec le titre correct", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };

    wrapper = mount(AdminView);

    await flushPromises();
    expect(wrapper.find('h2').text()).toBe("Panneau d'administration");
  });

  it("affiche trois boutons avec les textes corrects", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };

    wrapper = mount(AdminView);

    await flushPromises();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].text()).toContain("Créer un hôtel");
    expect(buttons[1].text()).toContain("Afficher les réservations");
    expect(buttons[2].text()).toContain("Gestion des comptes");
  });

  it("redirige vers la création d'hôtel lorsqu'on clique sur le bouton correspondant", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };
    wrapper = mount(AdminView);

    await flushPromises();

    await wrapper.find('button.btn-primary').trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/hotel/create');
  });

  it("redirige vers les réservations lorsqu'on clique sur le bouton correspondant", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };

    wrapper = mount(AdminView);

    await flushPromises();

    await wrapper.find('button.btn-secondary').trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith('bookings');
  });

  it("redirige vers la gestion des comptes lorsqu'on clique sur le bouton correspondant", async () => {
    userStore.user = {
      id: 1,
      email: 'admin@example.com',
      pseudo: 'adminuser',
      role: 'admin'
    };

    wrapper = mount(AdminView);

    await flushPromises();

    await wrapper.find('button.btn-danger').trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/accounts');
  });
});
