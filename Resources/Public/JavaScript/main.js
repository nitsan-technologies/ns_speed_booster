const constants = [TYPO3.settings];
console.log(constants);
let constValues = [];
constants.forEach(element => {
   constValues = 
   { 
    "mainClassName" : element.TS.mainClassName,
    "excludeUrls": element.TS.excludeUrls,
    "pageBackForwardReload": element.TS.pageBackForwardReload,
    "removeUsingPageClass" : element.TS.removeUsingPageClass,
    "removeUsingTargetClass" : element.TS.removeUsingTargetClass,
    "removeWithoutReloadUsingTargetClass" : element.TS.removeWithoutReloadUsingTargetClass,
    "enableProgressBar" : element.TS.enableProgressBar,
    "headerCollapse" : element.TS.headerCollapse,
    "langSwitch" : element.TS.langSwitch,
    "idBundleJs" : element.TS.idBundleJs,
    "errorMsg" : element.TS.errorMsg,
   };
});
const removeUsingTargetClass = constValues['removeUsingTargetClass'].split(",");
let fetchTargetClass= '';
for (let index = 0; index < removeUsingTargetClass.length; index++) {
    fetchTargetClass += removeUsingTargetClass[index] + " ";
}
const removeWithoutReloadUsingTargetClass = constValues['removeWithoutReloadUsingTargetClass'].split(",");
let fetchLoadTargetClass= '';
for (let index = 0; index < removeWithoutReloadUsingTargetClass.length; index++) {
    fetchLoadTargetClass += removeWithoutReloadUsingTargetClass[index] + " ";
}

function checkExcludeLinks(currentClassName, arrRemoveClass) {
    var isExclude = false;
    if(currentClassName != '') {
      const arrExcludeClass = currentClassName.split(' ');
      if(arrExcludeClass.length) {
        arrExcludeClass.map((isClassName, index) => {
          if(arrRemoveClass.includes(isClassName.replace(/\s/g, ''))) {
            isExclude = true;
          }
        });
      }
    }
    return isExclude;
  }
  
 
const mainSection = document.querySelector(`${constValues['mainClassName']}`);
const menuLinks = document.querySelectorAll('a:not([target])');

// If user click on back button page was reload
if (constValues['pageBackForwardReload']) {
    window.onpopstate = () => {window.location.reload();};
}

if (menuLinks.length && mainSection && !document.querySelector(`${constValues['removeUsingPageClass']}`)) {
    menuLinks.forEach((i) => {
    if (!i.hasAttribute('data-fancybox')) {
        i.addEventListener('click', (event) => {
        menuLinks.forEach((j) => {
            j.parentElement.classList.remove('active');
        });
        event.target.parentElement.classList.add('active');
        });
    }
    });

    document.addEventListener('click', (event) => { 
    if (event.target.href && !event.target.href.includes('tel:') && !event.target.href.includes('mailto:') && event.target.tagName === 'A' && !event.target.hasAttribute('target') && !event.target.hasAttribute('data-fancybox') && !event.target.hasAttribute('data-bs-toggle', 'modal') && !event.target.hasAttribute('data-glightbox') && !event.target.hasAttribute('data-darkbox') && !event.target.className.includes('cboxElement') ) {
        // Let's check for exclude links
        const isExcludeClass = checkExcludeLinks(event.target.className, fetchTargetClass);
        const isWithoutReloadExcludeClass = checkExcludeLinks(event.target.className, fetchLoadTargetClass);
        // Let's redirect to exclude links and #-links
        if (event.target.getAttribute('href').charAt(0) !== '#' && isExcludeClass && !isWithoutReloadExcludeClass) {
        window.location.href = event.target.href;
        } else if (!event.target.href.includes('javascript:;') && event.target.href.split('#').length === 1 && event.target.href.indexOf(`${constValues['excludeUrls']}`) === -1 && !isExcludeClass && !isWithoutReloadExcludeClass) {
        event.preventDefault();
        document.body.classList.add('ns-website-content');
        if (constValues['enableProgressBar']) {
            NProgress.configure({
            speed: 500,
            trickleSpeed: 600,
            showSpinner: false,
            });
            NProgress.start();
        }

        /* Scroll Top Of The Page */
        window.scroll({
            top: 0,
        });

        if (constValues['headerCollapse']) {
            const menuTrigger = document.querySelector('#menuTrigger');
            const bodyDiv = document.querySelector('body');
            bodyDiv.classList.remove('menu--open');
            menuTrigger.addEventListener('click', () => {
            bodyDiv.classList.toggle('menu--open');
            });

            if (event.target.parentElement.classList.contains('has-sub')) {
            event.target.parentNode.classList.toggle('active');
            event.target.parentNode.classList.toggle('slide--up');
            }
        }

        const url = event.target.href;
        window.history.pushState(null, null, url);
        fetch(url, {cache: "force-cache"}).then((response) => response.text()).then((html) => {
            /* Change Content of Main */
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector(`${constValues['mainClassName']}`);
            const langLink = document.querySelector(`${constValues['langSwitch']}`);
            mainSection.classList.add('fade');
            setTimeout(() => {
            if (mainContent) {
                mainSection.innerHTML = mainContent.innerHTML;
                mainSection.className = mainContent.className;
            }
            if (doc.title) {
                document.querySelector('title').innerHTML = doc.title;
            }

            if (langLink && langLink.href && doc.querySelector(`${constValues['langSwitch']}`) && doc.querySelector(`${constValues['langSwitch']}`).href) {
                langLink.href = doc.querySelector(`${constValues['langSwitch']}`).href;
            }

            if (constValues['enableProgressBar']) {
                NProgress.done();
            }

            if (constValues['idBundleJs']) {
                const script = document.createElement('script');
                script.src = document.getElementById(`${constValues['idBundleJs']}`).src;

                // append and execute script
                mainSection.append(script);
            }
            }, 300);
        }).catch((err) => {
            console.warn(constValues['errorMsg'], err);
            });
        } else if (event.target.getAttribute('href').charAt(0) == '#') {
        event.preventDefault();
        window.history.pushState(null, null, event.target.getAttribute('href'));
        document.querySelector(event.target.getAttribute('href')).scrollIntoView()
        }
    }
    });
}