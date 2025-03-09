import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue"
import NotFoundView from "@/views/NotFoundView.vue"
import AccountView from "@/views/AccountView.vue";
import HotelListView from "@/views/HotelListView.vue";
import ConsultHotel from "@/views/ConsultHotel.vue";
import BookingsView from "@/views/BookingsView.vue";
import AdminView from "@/views/AdminView.vue";
import CreateHotel from "@/views/CreateHotel.vue";
import RegisterView from "@/views/RegisterView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/hotels',
      name: 'hotels',
      component: HotelListView,
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
    },
    {
      path: '/hotel/:id',
      name: 'hotel',
      component: ConsultHotel,
      props: true,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: BookingsView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/admin/hotel/create',
      name: 'create-hotel',
      component: CreateHotel,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

export default router
