import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Explicit collection then curation. No API credentials or temporary CDN URLs enter site data.
try { process.loadEnvFile('.env'); } catch(e) { if(e.code!=='ENOENT') throw e; }
const staging='.instagram-import';
const allowedKinds=new Set(['fashion','weddings','portraits','films','projects']);
const validId=id=>/^\d{1,64}$/.test(String(id));
function mediaUrl(value){const u=new URL(value);if(u.protocol!=='https:' || !['cdninstagram.com','fbcdn.net'].some(host=>u.hostname===host||u.hostname.endsWith('.'+host)))throw new Error('Unexpected media host');return u;}
async function download(value,maxBytes){let u=mediaUrl(value);for(let redirect=0;redirect<5;redirect++){const response=await fetch(u,{redirect:'manual',signal:AbortSignal.timeout(60000)});if([301,302,303,307,308].includes(response.status)){u=mediaUrl(new URL(response.headers.get('location'),u).href);continue;}if(!response.ok)throw new Error('Media download failed: HTTP '+response.status);const parts=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>maxBytes)throw new Error('Media exceeds the import size limit');parts.push(chunk);}return Buffer.concat(parts);}throw new Error('Too many media redirects');}
async function api(endpoint,params={}){
 const token=process.env.INSTAGRAM_ACCESS_TOKEN;
 if(!token)throw new Error('Set INSTAGRAM_ACCESS_TOKEN in your ignored .env file before collecting.');
 const url=new URL('https://graph.instagram.com/'+endpoint);for(const [key,value] of Object.entries(params))url.searchParams.set(key,value);
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Instagram API returned HTTP '+response.status+'. Check the token and permissions.');
 return response.json();
}
async function collect(){
 const items=[];let after;let pages=0;
 do {const page=await api('me/media',{fields:'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',limit:'25',...(after?{after}:{})});
 for(const post of page.data||[]){if(!validId(post.id))continue;let children=[post];
 if(post.media_type==='CAROUSEL_ALBUM'){const childData=await api(post.id+'/children',{fields:'id,media_type,media_url,thumbnail_url',limit:'100'});children=childData.data||[];}
 for(const child of children){if(!validId(child.id)||!['IMAGE','VIDEO'].includes(child.media_type))continue;items.push({id:String(child.id),postId:String(post.id),type:child.media_type,caption:post.caption||'',permalink:post.permalink,timestamp:post.timestamp,mediaUrl:child.media_url,thumbnailUrl:child.thumbnail_url||child.media_url});}}
 after=page.paging?.next?page.paging?.cursors?.after:undefined;pages++;
 } while(after&&pages<4);
 await fs.mkdir(staging,{recursive:true});
 for(const item of items){const url=item.type==='VIDEO'?item.thumbnailUrl:item.mediaUrl;if(!url)continue;const bytes=await download(url,25*1024*1024);await sharp(bytes).rotate().resize({width:600,withoutEnlargement:true}).webp({quality:78}).toFile(path.join(staging,item.id+'.webp'));}
 // Preserve the previous index until all thumbnail downloads succeed.
 await fs.writeFile(path.join(staging,'index.json'),JSON.stringify({collectedAt:new Date().toISOString(),items,hasMore:Boolean(after)},null,2));
 console.log('Collected '+items.length+' media items for visual review. '+(after?'More posts are available beyond this bounded batch.':''));
}
async function publish(){
 const selections=JSON.parse(await fs.readFile('instagram-selection.json','utf8'));
 if(!Array.isArray(selections)||!selections.length)throw new Error('Review thumbnails and fill instagram-selection.json before import.');
 const {items}=JSON.parse(await fs.readFile(path.join(staging,'index.json'),'utf8'));
 const albums=[];await fs.mkdir('public/instagram',{recursive:true});const seen=new Set();
 for(const selection of selections){
 if(!validId(selection.id)||seen.has(selection.id)||!allowedKinds.has(selection.category)||!selection.title?.trim()||!selection.alt?.trim())throw new Error('Each selection needs a unique numeric id, category, title and alt text.');seen.add(selection.id);
 const item=items.find(i=>i.id===selection.id);if(!item)throw new Error('Selected media is missing from the collected batch.');
 const base='/instagram/'+item.id;let video;
 if(item.type==='VIDEO'){const bytes=await download(item.mediaUrl,80*1024*1024);if(bytes.toString('ascii',4,8)!=='ftyp')throw new Error('Expected an MP4 video');await fs.writeFile('public'+base+'.mp4',bytes);video=base+'.mp4';}
 const imageBytes=await download(item.type==='VIDEO'?item.thumbnailUrl:item.mediaUrl,25*1024*1024);
 const metadata=await sharp(imageBytes).metadata();await sharp(imageBytes).rotate().resize({width:1800,withoutEnlargement:true}).webp({quality:82}).toFile('public'+base+'.webp');
 const cover={src:base+'.webp',width:metadata.width,height:metadata.height,alt:selection.alt};
 const permalink=new URL(item.permalink);if(permalink.protocol!=='https:'||!['www.instagram.com','instagram.com'].includes(permalink.hostname))throw new Error('Invalid Instagram permalink');
 albums.push({slug:'instagram-'+item.id,title:selection.title,kind:selection.category,description:selection.description||'',featured:selection.featured===true,cover,photos:item.type==='IMAGE'?[cover]:[],localVideo:video,instagramUrl:permalink.href});
 }
 // Merge updates by slug; a later import does not erase previous reviewed imports.
 const existing=JSON.parse(await fs.readFile('src/data/instagram-portfolio.json','utf8'));
 const merged=[...new Map([...existing.albums,...albums].map(a=>[a.slug,a])).values()];
 await fs.writeFile('src/data/instagram-portfolio.json',JSON.stringify({albums:merged},null,2));
 console.log('Imported '+albums.length+' reviewed items. Build the site to preview.');
}
try {if(process.argv.includes('--publish'))await publish();else await collect();}catch(error){console.error(error.message);process.exitCode=1;}
