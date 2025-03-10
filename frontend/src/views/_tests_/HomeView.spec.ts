import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HomeView from '../HomeView.vue';

describe('HomeView.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HomeView);
  });

  it('devrait afficher le composant correctement', () => {
    expect(wrapper.exists()).toBeTruthy();
  });

  it('devrait afficher le titre principal', () => {
    const title = wrapper.find('h1');
    expect(title.exists()).toBeTruthy();
    expect(title.text()).toBe("Trouvez l'hotel qui vous convient pour des vacances à votre image");
  });

  it('devrait afficher le sous-titre sur le nombre d\'hôtels', () => {
    const subtitle = wrapper.find('p.fw-bold.text-success');
    expect(subtitle.exists()).toBeTruthy();
    expect(subtitle.text()).toContain('Plus de 20 000 Hotels partout dans le monde');
  });

  it('devrait contenir trois images dans l\'en-tête', () => {
    const headerImages = wrapper.findAll('header img.img-fluid');
    expect(headerImages.length).toBe(3);
  });

});
