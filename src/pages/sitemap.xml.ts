import type {APIRoute} from 'astro';
import {content,albumKind} from '../lib/content';
const escapeXml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export const GET:APIRoute=async({site})=>{
 const {albums}=await content();
 const base=site || new URL('https://ergysshehu.com');
 const paths=['/','/about/','/projects/',...['fashion','portraits','weddings','films'].filter(kind=>albums.some(a=>albumKind(a)===kind)).map(kind=>`/${kind}/`),...albums.map(a=>`/portfolio/${a.slug}/`)];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(paths)].map(p=>`<url><loc>${escapeXml(new URL(p,base).href)}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
