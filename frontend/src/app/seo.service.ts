import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoPage {
  title: string;
  description: string;
  path: string;
  robots?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteUrl = 'https://safesec-formation.fr';
  private readonly socialImage = `${this.siteUrl}/assets/imgs/logo_safesec_og.png`;

  constructor(
    private readonly titleService: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  updatePage(page: SeoPage): void {
    const canonicalUrl = `${this.siteUrl}${page.path}`;
    this.titleService.setTitle(page.title);

    this.setName('description', page.description);
    this.setName('robots', page.robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    this.setName('author', 'SAFESEC Formation');
    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', page.title);
    this.setName('twitter:description', page.description);
    this.setName('twitter:image', this.socialImage);

    this.setProperty('og:title', page.title);
    this.setProperty('og:description', page.description);
    this.setProperty('og:type', 'website');
    this.setProperty('og:url', canonicalUrl);
    this.setProperty('og:image', this.socialImage);
    this.setProperty('og:image:alt', 'SAFESEC Formation, prévention, sécurité et secourisme');
    this.setProperty('og:site_name', 'SAFESEC Formation');
    this.setProperty('og:locale', 'fr_FR');

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const previousScript = this.document.getElementById('structured-data');
    previousScript?.remove();

    if (page.structuredData) {
      const script = this.document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(page.structuredData).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name="${name}"`);
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property="${property}"`);
  }
}
