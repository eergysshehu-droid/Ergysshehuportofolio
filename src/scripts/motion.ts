const preference=matchMedia('(prefers-reduced-motion: reduce)');
if(!preference.matches && 'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08});
 document.querySelectorAll('.project-card,.work-heading,.artist-copy,.contact-section,.biography-layout').forEach((el,i)=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-ready');(el as HTMLElement).style.setProperty('--reveal-delay',`${(i%3)*70}ms`);observer.observe(el);}});
 const picture=document.querySelector<HTMLElement>('.cinematic-opening .opening-image');let pending=false;
 if(picture)window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{if(!preference.matches&&scrollY<innerHeight)picture.style.transform=`translate3d(0,${Math.min(scrollY*.12,100)}px,0)`;pending=false;});}},{passive:true});
}
