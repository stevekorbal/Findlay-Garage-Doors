import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ServiceView from './components/ServiceView';
import CityView from './components/CityView';
import FaqView from './components/FaqView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import LegalViews from './components/LegalViews';
import ServiceAreasView from './components/ServiceAreasView';
import WhyChooseUsView from './components/WhyChooseUsView';
import BlogIndexView from './components/BlogIndexView';
import BlogPostView from './components/BlogPostView';
import { getBlogPostBySlug } from './lib/blogLoader';
import { servicesData } from './data/servicesData';
import { citiesData } from './data/citiesData';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
    return path;
  });

  // Google Analytics & Search Console Integration
  useEffect(() => {
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const searchConsoleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

    // 1. Google Search Console Verification Tag Update
    if (searchConsoleVerification && searchConsoleVerification !== 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE') {
      let gscMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gscMeta) {
        gscMeta = document.createElement('meta');
        gscMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gscMeta);
      }
      gscMeta.setAttribute('content', searchConsoleVerification);
    }

    // 2. Google Analytics (GA4) Integration
    if (gaMeasurementId && gaMeasurementId !== 'G-XXXXXXXXXX') {
      try {
        if (!document.getElementById('ga-gtag-script')) {
          const script = document.createElement('script');
          script.id = 'ga-gtag-script';
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
          script.onerror = (err) => {
            console.warn('Google Analytics script failed to load:', err);
          };
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          window.gtag = function () {
            try {
              window.dataLayer?.push(arguments);
            } catch (e) {
              // Ignore analytics push errors
            }
          };
          window.gtag('js', new Date());
          window.gtag('config', gaMeasurementId);
        } else if (typeof window.gtag === 'function') {
          // Send page view event on route change
          const pagePath = currentPath === 'home' || currentPath === '' ? '/' : `/${currentPath}`;
          window.gtag('config', gaMeasurementId, {
            page_path: pagePath,
            page_title: document.title
          });
        }
      } catch (err) {
        console.warn('Google Analytics initialization error:', err);
      }
    }
  }, [currentPath]);

  // Monitor URL history state routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Tag and Schema Injection
  useEffect(() => {
    // 1. Determine Title & Description based on currentPath
    let title = 'Garage Door Repair Findlay OH | Same-Day Service';
    let description = 'Premium, fast-loading garage door repair, spring replacement, opener installation, and 24/7 emergency services in Findlay, OH and surrounding Hancock County areas.';
    let schemaJson: any = null;

    const baseDomain = 'https://findlaygaragedoorrepair.com';
    const canonicalUrl = `${baseDomain}/${currentPath === 'home' || currentPath === '' ? '' : currentPath}`;

    const serviceIds = [
      'garage-door-repair',
      'garage-door-spring-repair',
      'garage-door-opener-repair',
      'garage-door-opener-installation',
      'garage-door-installation',
      'emergency-garage-door-repair'
    ];

    let cleanServiceId = '';
    if (currentPath.startsWith('service/')) {
      cleanServiceId = currentPath.split('/')[1];
    } else if (serviceIds.includes(currentPath)) {
      cleanServiceId = currentPath;
    }

    if (cleanServiceId && servicesData[cleanServiceId]) {
      const service = servicesData[cleanServiceId];
      title = service.metaTitle;
      description = service.metaDescription;

      // Build Service Schema & FAQ Schema
      const mainSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': service.title.split('|')[0].trim(),
        'description': service.shortDesc,
        'provider': {
          '@type': 'LocalBusiness',
          'name': 'Findlay Garage Door Repair',
          'telephone': '+14195558240',
          'priceRange': '$$',
          'image': 'https://findlaygaragedoorrepair.com/images/garage-door-repair.webp',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '120 W Main St',
            'addressLocality': 'Findlay',
            'addressRegion': 'OH',
            'postalCode': '45840',
            'addressCountry': 'US'
          }
        },
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Findlay, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Arlington, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Vanlue, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Mount Blanchard, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Rawson, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Benton Ridge, OH' },
          { '@type': 'AdministrativeArea', 'name': 'North Baltimore, OH' },
          { '@type': 'AdministrativeArea', 'name': 'McComb, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Bluffton, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Fostoria, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Carey, OH' }
        ]
      };

      if (service.faqs && service.faqs.length > 0) {
        schemaJson = [
          mainSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': service.faqs.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          }
        ];
      } else {
        schemaJson = mainSchema;
      }
    } else if (currentPath.startsWith('city/')) {
      const cityId = currentPath.split('/')[1];
      if (citiesData[cityId]) {
        const city = citiesData[cityId];
        title = city.metaTitle;
        description = city.metaDescription;

        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': `Findlay Garage Door Repair - ${city.cityName}`,
          'description': city.intro,
          'telephone': '+14195558240',
          'priceRange': '$$',
          'url': canonicalUrl,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city.cityName.split(',')[0].trim(),
            'addressRegion': 'OH',
            'addressCountry': 'US'
          }
        };
      }
    } else if (currentPath === 'blog') {
      title = 'Garage Door Repair & Maintenance Blog | Findlay OH';
      description = 'Expert tips, maintenance checklists, and troubleshooting guides from certified garage door specialists in Findlay, OH and Hancock County.';
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': 'Findlay Garage Door Repair Blog',
        'description': description,
        'url': canonicalUrl,
        'publisher': {
          '@type': 'Organization',
          'name': 'Findlay Garage Door Repair'
        }
      };
    } else if (currentPath.startsWith('blog/')) {
      const slug = currentPath.slice(5);
      const post = getBlogPostBySlug(slug);
      if (post) {
        title = `${post.title} | Findlay Garage Door Repair`;
        description = post.description;
        const imageUrl = post.featuredImage.startsWith('http')
          ? post.featuredImage
          : `${baseDomain}${post.featuredImage.startsWith('/') ? '' : '/'}${post.featuredImage}`;

        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'description': post.description,
          'image': imageUrl,
          'datePublished': post.date,
          'dateModified': post.updatedDate || post.date,
          'author': {
            '@type': 'Person',
            'name': post.author
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Findlay Garage Door Repair',
            'logo': {
              '@type': 'ImageObject',
              'url': `${baseDomain}/images/garage-door-repair.webp`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl
          },
          'keywords': post.primaryKeyword
        };
      } else {
        title = 'Blog Article | Findlay Garage Door Repair';
        description = 'Read garage door repair and maintenance guides from Findlay Garage Door Repair.';
      }
    } else {
      switch (currentPath) {
        case 'about':
          title = 'About Us | Findlay Garage Door Repair Findlay OH';
          description = 'Learn about Findlay Garage Door Repair in Findlay, OH. Licensed, bonded, and insured local overhead door specialists in Hancock County.';
          break;
        case 'why-choose-us':
          title = 'Why Choose Us | Findlay Garage Door Repair Findlay OH';
          description = 'Discover why homeowners and businesses in Findlay, OH trust us for their garage door repairs and installations. Same-day service, clear warranties.';
          break;
        case 'service-areas':
          title = 'Service Areas | Garage Door Repair in Findlay OH & Hancock County';
          description = 'We proudly serve Findlay, Arlington, Vanlue, Mount Blanchard, Rawson, Benton Ridge, North Baltimore, McComb, Bluffton, Fostoria, and Carey, OH.';
          break;
        case 'faqs':
          title = 'Frequently Asked Questions | Garage Door Repair Findlay OH';
          description = 'Got questions about broken springs, opener issues, or new door installations? Check out our helpful FAQs or call today for immediate help.';
          break;
        case 'contact':
          title = 'Contact Us | Findlay Garage Door Repair Findlay OH';
          description = 'Get in touch with our local team for emergency repairs or free estimates in Findlay, OH. We\'re available 24/7 at (419) 555-8240.';
          break;
        case 'privacy-policy':
          title = 'Privacy Policy | Findlay Garage Door Repair';
          description = 'Read our privacy policy to understand how we protect your information when you contact us for garage door services.';
          break;
        case 'terms-and-conditions':
          title = 'Terms & Conditions | Findlay Garage Door Repair';
          description = 'Review our service terms and conditions for residential and commercial garage door services in Findlay, OH.';
          break;
        default:
          title = 'Garage Door Repair Findlay OH | Same-Day Service';
          description = 'Premium, fast-loading garage door repair, spring replacement, opener installation, and 24/7 emergency services in Findlay, OH and surrounding Hancock County areas.';
          break;
      }

      // Default LocalBusiness Schema for static views / home
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Findlay Garage Door Repair',
        'image': 'https://findlaygaragedoorrepair.com/images/garage-door-repair.webp',
        '@id': 'https://findlaygaragedoorrepair.com/',
        'url': 'https://findlaygaragedoorrepair.com/',
        'telephone': '+14195558240',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '120 W Main St',
          'addressLocality': 'Findlay',
          'addressRegion': 'OH',
          'postalCode': '45840',
          'addressCountry': 'US'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 41.0442,
          'longitude': -83.6499
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ],
          'opens': '00:00',
          'closes': '23:59'
        },
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Findlay, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Arlington, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Vanlue, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Mount Blanchard, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Rawson, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Benton Ridge, OH' },
          { '@type': 'AdministrativeArea', 'name': 'North Baltimore, OH' },
          { '@type': 'AdministrativeArea', 'name': 'McComb, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Bluffton, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Fostoria, OH' },
          { '@type': 'AdministrativeArea', 'name': 'Carey, OH' }
        ]
      };
    }

    // 2. Set Document Title
    document.title = title;

    // 3. Set Description Meta tag
    let metaDescriptionEl = document.querySelector('meta[name="description"]');
    if (!metaDescriptionEl) {
      metaDescriptionEl = document.createElement('meta');
      metaDescriptionEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionEl);
    }
    metaDescriptionEl.setAttribute('content', description);

    // 4. Set Canonical Link tag
    let canonicalLinkEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalLinkEl) {
      canonicalLinkEl = document.createElement('link');
      canonicalLinkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLinkEl);
    }
    canonicalLinkEl.setAttribute('href', canonicalUrl);

    // 5. Inject/Update Schema JSON-LD script
    let schemaScriptEl = document.getElementById('seo-schema-markup');
    if (schemaScriptEl) {
      schemaScriptEl.remove();
    }
    if (schemaJson) {
      schemaScriptEl = document.createElement('script');
      schemaScriptEl.setAttribute('id', 'seo-schema-markup');
      schemaScriptEl.setAttribute('type', 'application/ld+json');
      schemaScriptEl.textContent = JSON.stringify(schemaJson);
      document.head.appendChild(schemaScriptEl);
    }
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    const targetPath = path === 'home' || path === '' ? '/' : `/${path}`;
    window.history.pushState(null, '', targetPath);
    setCurrentPath(path === 'home' ? 'home' : path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Render correct view based on path
  const renderContent = () => {
    if (currentPath === 'home' || currentPath === '') {
      return <HomeView onNavigate={handleNavigate} />;
    }
    
    const serviceIds = [
      'garage-door-repair',
      'garage-door-spring-repair',
      'garage-door-opener-repair',
      'garage-door-opener-installation',
      'garage-door-installation',
      'emergency-garage-door-repair'
    ];

    if (currentPath.startsWith('service/')) {
      const serviceId = currentPath.split('/')[1];
      return <ServiceView serviceId={serviceId} onNavigate={handleNavigate} />;
    }

    if (serviceIds.includes(currentPath)) {
      return <ServiceView serviceId={currentPath} onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('city/')) {
      const cityId = currentPath.split('/')[1];
      return <CityView cityId={cityId} onNavigate={handleNavigate} />;
    }

    if (currentPath === 'blog') {
      return <BlogIndexView onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('blog/')) {
      const slug = currentPath.slice(5);
      return <BlogPostView slug={slug} onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case 'about':
        return <AboutView onNavigate={handleNavigate} />;
      case 'why-choose-us':
        return <WhyChooseUsView onNavigate={handleNavigate} />;
      case 'service-areas':
        return <ServiceAreasView onNavigate={handleNavigate} />;
      case 'faqs':
        return <FaqView onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactView onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <LegalViews type="privacy" onNavigate={handleNavigate} />;
      case 'terms-and-conditions':
        return <LegalViews type="terms" onNavigate={handleNavigate} />;
      default:
        // Default Fallback
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Dynamic Header */}
      <Header currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Primary Page Content */}
      <main className="flex-grow w-full">
        {renderContent()}
      </main>

      {/* Unified Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
