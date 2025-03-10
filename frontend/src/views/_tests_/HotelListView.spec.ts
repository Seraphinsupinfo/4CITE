import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import HotelListView from '../HotelListView.vue';
import api from '@/services/axiosConfig.ts';

vi.mock('@/services/axiosConfig.ts', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('HotelListView.vue', () => {
  let wrapper;

  const mockHotels = [
    {
      id: 1,
      name: 'Hôtel Paris',
      location: 'Paris, France',
      description: 'Un bel hôtel à Paris',
      images: ['https://example.com/image1.jpg'],
      creationDate: '2023-12-10'
    },
    {
      id: 2,
      name: 'Hôtel Nice',
      location: 'Nice, France',
      description: 'Un magnifique hôtel à Nice',
      images: ['https://example.com/image2.jpg'],
      creationDate: '2023-12-09'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockResolvedValue({
      data: mockHotels
    });
  });

  it('devrait appeler l\'API pour récupérer les hôtels lors du montage', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/hotels', {
      params: {
        sortBy: 'creationDate',
        limit: 100
      }
    });
  });

  it('devrait afficher le titre et le sous-titre de la section', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const title = wrapper.find('h2.fw-bold');
    expect(title.exists()).toBeTruthy();
    expect(title.text()).toBe('Hôtels');

    const subtitle = wrapper.find('p.text-muted');
    expect(subtitle.exists()).toBeTruthy();
  });

  it('devrait afficher la liste des hôtels correctement', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const hotelCards = wrapper.findAll('.card');
    expect(hotelCards.length).toBe(mockHotels.length);

    const firstHotelCard = hotelCards[0];
    expect(firstHotelCard.find('h4').text()).toBe(mockHotels[0].name);
    expect(firstHotelCard.find('p.text-muted').text()).toBe(mockHotels[0].location);
    expect(firstHotelCard.find('img').attributes('src')).toBe(mockHotels[0].images[0]);
  });

  it('devrait avoir les bons liens vers les pages de détails des hôtels', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const hotelLinks = wrapper.findAll('a[href^="/hotel/"]');
    expect(hotelLinks.length).toBe(mockHotels.length * 2); // 2 liens par hôtel (image et bouton)

    expect(hotelLinks[0].attributes('href')).toBe(`/hotel/${mockHotels[0].id}`);
    expect(hotelLinks[1].attributes('href')).toBe(`/hotel/${mockHotels[0].id}`);
    expect(hotelLinks[1].text()).toBe('Consulter');
  });

  it('devrait afficher le badge "Disponible" pour chaque hôtel', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const badges = wrapper.findAll('.badge.bg-success');
    expect(badges.length).toBe(mockHotels.length);

    badges.forEach(badge => {
      expect(badge.text()).toBe('Disponible');
    });
  });

  it('devrait correctement afficher les images avec la classe et le style appropriés', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const images = wrapper.findAll('img.rounded.img-fluid');
    expect(images.length).toBe(mockHotels.length);

    images.forEach((image, index) => {
      expect(image.attributes('src')).toBe(mockHotels[index].images[0]);
      expect(image.attributes('style')).toBe('height: 250px;');
      expect(image.classes()).toContain('w-100');
      expect(image.classes()).toContain('fit-cover');
    });
  });

  it('devrait gérer le cas où aucun hôtel n\'est retourné', async () => {
    api.get.mockResolvedValue({
      data: []
    });

    wrapper = mount(HotelListView);
    await flushPromises();

    const hotelCards = wrapper.findAll('.card');
    expect(hotelCards.length).toBe(0);
  });

  it('devrait gérer le cas où la récupération des hôtels échoue', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValue(new Error('Erreur API'));

    wrapper = mount(HotelListView);
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la récupération des hôtels :',
      expect.any(Error)
    );

    const hotelCards = wrapper.findAll('.card');
    expect(hotelCards.length).toBe(0);

    consoleErrorSpy.mockRestore();
  });

  it('devrait avoir une structure de card correcte pour chaque hôtel', async () => {
    wrapper = mount(HotelListView);
    await flushPromises();

    const firstCard = wrapper.findAll('.card')[0];

    expect(firstCard.find('.card-body').exists()).toBeTruthy();
    expect(firstCard.find('.card-body').classes()).toContain('d-flex');
    expect(firstCard.find('.card-body').classes()).toContain('justify-content-between');
    expect(firstCard.find('.card-body').classes()).toContain('align-items-center');

    const button = firstCard.find('a.btn.btn-primary');
    expect(button.exists()).toBeTruthy();
    expect(button.text()).toBe('Consulter');
    expect(button.classes()).toContain('btn-sm');
  });
});
