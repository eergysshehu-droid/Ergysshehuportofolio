import fs from 'node:fs';
import path from 'node:path';
import {createClient} from '@sanity/client';
// Run through `sanity exec scripts/import-sanity.mjs --with-user-token` after login.
// Creates missing draft documents only. Existing published/draft documents are preserved.
const token=process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN;
if(!token) throw new Error('Sign in to Sanity and run with --with-user-token. Never commit credentials.');
const client=createClient({projectId:'46mghxoy',dataset:'production',apiVersion:'2026-09-01',useCdn:false,token});
const data=JSON.parse(fs.readFileSync('src/data/local-portfolio.json','utf8'));
const assets=new Map();
async function photo(source){
 if(!source?.src) return source;
 if(!assets.has(source.src)) {
   const file=path.join('public',source.src.replace(/^\//,''));
   const asset=await client.assets.upload('image',fs.createReadStream(file),{filename:path.basename(file)});
   assets.set(source.src,asset._id);
 }
 return {_type:'portfolioPhoto',asset:{_type:'reference',_ref:assets.get(source.src)},alt:source.alt || 'Photograph by Ergys Shehu'};
}
for(const album of data.albums){
 const id='portfolio-'+album.slug;
 const existing=await client.fetch('*[_id in $ids][0]._id',{ids:[id,'drafts.'+id]});
 if(existing){console.log('Preserved existing '+album.slug);continue;}
 const photos=[];for(const [index,p] of album.photos.entries())photos.push({...await photo(p),_key:'photo-'+index});
 await client.createIfNotExists({_id:'drafts.'+id,_type:'album',title:album.title,slug:{_type:'slug',current:album.slug},kind:album.kind,description:album.description,order:album.order,featured:album.featured,cover:await photo(album.cover),photos});
 console.log('Created draft '+album.slug);
}
const existingSettings=await client.fetch('*[_id in ["siteSettings","drafts.siteSettings"]][0]._id');
if(!existingSettings){const settings={};for(const [key,value] of Object.entries(data.settings))settings[key]=await photo(value);await client.createIfNotExists({_id:'drafts.siteSettings',_type:'siteSettings',name:'Ergys Shehu',...settings});}
console.log('Draft import complete. Review and publish in Studio. No existing documents were overwritten.');
