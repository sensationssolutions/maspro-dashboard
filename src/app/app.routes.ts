import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    canActivate: [authGuard]
  },

  // Categories (Level 1)
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then(m => m.Categories),
    canActivate: [authGuard]
  },


  {
    path: 'addproduct',
    loadComponent: () => import('./pages/addproduct/addproduct').then(m => m.Addproduct),
    canActivate: [authGuard]
  },
  {
    path: 'editproduct/:id',
    loadComponent: () => import('./pages/editproduct/editproduct').then(m => m.Editproduct),
    canActivate: [authGuard]
  },

  {
    path: 'subcategories',
    loadComponent: () => import('./pages/subcategories/subcategories').then(m => m.Subcategories),
    canActivate: [authGuard]
  },

  {
    path: 'addsubcategory',
    loadComponent: () => import('./pages/addsubcategory/addsubcategory').then(m => m.Addsubcategory),
    canActivate: [authGuard]
  },

  {
    path: 'editsubcategory/:id',
    loadComponent: () => import('./pages/editsubcategory/editsubcategory').then(m => m.Editsubcategory),
    canActivate: [authGuard]
  },

  {
    path: 'productcategories',
    loadComponent: () => import('./pages/productcategories/productcategories').then(m => m.Productcategories),
    canActivate: [authGuard]
  },

  {
    path: 'addproductcategory',
    loadComponent: () => import('./pages/addproductcategory/addproductcategory').then(m => m.Addproductcategory),
    canActivate: [authGuard]
  },

  {
    path: 'editproductcategory/:id',
    loadComponent: () => import('./pages/editproductcategory/editproductcategory').then(m => m.Editproductcategory),
    canActivate: [authGuard]
  },



  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then(m => m.Products),
    canActivate: [authGuard]
  },


  // {
  //   path: 'categories/:categoryId/types',
  //   loadComponent: () => import('./pages/types/types').then(m => m.Types),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'types/:typeId/products',
  //   loadComponent: () => import('./pages/products/products').then(m => m.Products),
  //   canActivate: [authGuard]
  // },


  {
    path: 'products/:productId',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
    canActivate: [authGuard]
  },

  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then(m => m.Services),
    canActivate: [authGuard]
  },
  {
    path: 'careers',
    loadComponent: () => import('./pages/careers/careers').then(m => m.Careers),
    canActivate: [authGuard]
  },
  {
    path: 'testimonials',
    loadComponent: () => import('./pages/testimonials/testimonials').then(m => m.Testimonials),
    canActivate: [authGuard]
  },

  {
    path: 'addservice',
    loadComponent: () => import('./pages/addservice/addservice').then(m => m.Addservice),
    canActivate: [authGuard]
  },

  {
    path: 'editservice/:id',
    loadComponent: () => import('./pages/editservice/editservice').then(m => m.Editservice),
    canActivate: [authGuard] 
  },


  {
    path: 'addtestimonial',
    loadComponent: () => import('./pages/addtestimonial/addtestimonial').then(m => m.Addtestimonial),
    canActivate: [authGuard] 
  },

  {
    path: 'edittestimonial/:id',
    loadComponent: () => import('./pages/edittestimonial/edittestimonial').then(m => m.Edittestimonial),
    canActivate: [authGuard]
  },

  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
    canActivate: [authGuard]
  },

  {
    path: 'slider',
    loadComponent: () => import('./pages/slider/slider').then(m => m.Slider),
    canActivate: [authGuard]
  },

  {
    path: 'addslider',
    loadComponent: () => import('./pages/addslider/addslider').then(m => m.Addslider),
    canActivate: [authGuard]
  },

  {
    path: 'editslider/:id',
    loadComponent: () => import('./pages/editslider/editslider').then(m => m.Editslider),
    canActivate: [authGuard]
  },

  {
    path: 'partners',
    loadComponent: () => import('./pages/partners/partners').then(m => m.Partners),
    canActivate: [authGuard]
  },

  {
    path: 'addpartners',
    loadComponent: () => import('./pages/addpartners/addpartners').then(m => m.Addpartners),
    canActivate: [authGuard]
  },

  {
    path: 'editpartners/:id',
    loadComponent: () => import('./pages/editpartners/editpartners').then(m => m.Editpartners),
    canActivate: [authGuard]
  },

  {
    path: 'addcareers',
    loadComponent: () => import('./pages/addcareers/addcareers').then(m => m.Addcareers),
    canActivate: [authGuard]
  },

  {
    path: 'sitedetails',
    loadComponent: () => import('./pages/sitedetails/sitedetails').then(m => m.Sitedetails),
    canActivate: [authGuard]
  },

  {
    path: 'websitepieces',
    loadComponent: () => import('./pages/websitepieces/websitepieces').then(m => m.Websitepieces),
    canActivate: [authGuard]
  },

  // Add/Edit routes
  {
    path: 'addcategory',
    loadComponent: () => import('./pages/addcategory/addcategory').then(m => m.Addcategory),
    canActivate: [authGuard]
  },
  {
    path: 'editcategory/:id',
    loadComponent: () => import('./pages/editcategory/editcategory').then(m => m.Editcategory),
    canActivate: [authGuard]
  },
  {
    path: 'addtype',
    loadComponent: () => import('./pages/addtype/addtype').then(m => m.Addtype),
    canActivate: [authGuard]
  },
  {
    path: 'edittype/:id',
    loadComponent: () => import('./pages/edittype/edittype').then(m => m.Edittype),
    canActivate: [authGuard]
  },


];

