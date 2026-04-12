(function(){
  var cfg = window.MEMORIAL_ANALYTICS || {};
  var mid = cfg.measurementId || "";
  if (!mid || mid === "G-COLE_AQUI_O_SEU_ID") return;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(mid);
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', mid, {
    page_path: location.pathname + location.search,
    page_title: document.title
  });

  try {
    var params = new URLSearchParams(location.search);
    var qr = params.get('qr');
    if (qr) {
      gtag('event', 'qr_access', {
        qr_item: qr,
        page_path: location.pathname,
        page_location: location.href
      });
    }
  } catch(e) {}
})();
