var cbpAnimatedHeader=function(){var e=document.documentElement,n=document.querySelector(".navbar-default"),a=!1,t=300;function o(){(window.pageYOffset||e.scrollTop)>=t?classie.add(n,"navbar-shrink"):classie.remove(n,"navbar-shrink"),a=!1}window.addEventListener("scroll",function(e){a||(a=!0,setTimeout(o,250))},!1)}();