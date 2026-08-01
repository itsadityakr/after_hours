/**
 * Puts the loading cat on the boot screen.
 *
 * Outside the bundle on purpose. The boot screen in index.html exists because
 * every guide on this site is compiled into one file, and a loader that ships
 * inside the bundle it is waiting for cannot be seen — so the mark it starts
 * with is CSS, which needs nothing at all. This is the upgrade, and it has to
 * play by the same rule: a plain deferred script next to a plain deferred
 * player, both of them small, both done well before the app they are covering
 * for. On a fast connection nobody sees either; on a slow one, which is the
 * case the boot screen exists for, the cat has time to arrive and sit there.
 *
 * Everything here is conditional on the boot screen still being up. If the app
 * painted first there is nothing left to decorate.
 */
;(function () {
  var mark = document.getElementById('boot-mark')
  var booting = function () {
    return document.documentElement.hasAttribute('data-booting')
  }

  // A reader who asked for less motion is not shown a looping animation as the
  // very first thing on the page. The breathing square is already stopped by
  // the reduced-motion block in index.html, so leaving it there is the right
  // answer rather than a missing feature.
  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!mark || !booting() || reduced || !window.lottie) return

  // Relative to the document, like every other asset here: the site is served
  // from a project page today and could be served from a subfolder tomorrow,
  // and an absolute path would only be right in one of those.
  fetch(new URL('animations/cat-loading.json', document.baseURI).href)
    .then(function (r) {
      if (!r.ok) throw new Error('cat-loading: ' + r.status)
      return r.json()
    })
    .then(function (animationData) {
      // Checked again rather than once: the fetch is the wait, and the app
      // finishing during it is the likely case, not the unlikely one.
      if (!booting() || !mark.isConnected) return

      var stage = document.createElement('div')
      stage.id = 'boot-cat'
      mark.replaceWith(stage)
      window.lottie.loadAnimation({
        container: stage,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      })
    })
    // A failure here leaves the square breathing, which is what was there
    // before any of this and is a perfectly good loading screen.
    .catch(function () {})
})()
