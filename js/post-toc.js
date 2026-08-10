(function () {
  const post = document.querySelector('#main-content > .post');
  const content = post && post.querySelector(':scope > .content');
  const toc = post && post.querySelector(':scope > aside > .toc');

  if (!post || !content || !toc) return;

  const aside = toc.parentElement;
  const links = Array.from(toc.querySelectorAll('a[href^="#"]'));

  const entries = links
    .map(function (link) {
      let id;

      try {
        id = decodeURIComponent(link.hash.slice(1));
      } catch (error) {
        id = link.hash.slice(1);
      }

      const heading = document.getElementById(id);
      return heading ? { heading: heading, link: link } : null;
    })
    .filter(Boolean);

  if (!entries.length) return;

  aside.classList.add('post-toc');
  aside.setAttribute('aria-label', 'Content');
  toc.id = 'post-toc-list';
  toc.setAttribute('data-lenis-prevent', '');

  const title = document.createElement('p');
  title.className = 'post-toc__title';
  title.textContent = 'Content';
  aside.insertBefore(title, toc);

  const toggle = document.createElement('button');
  toggle.className = 'post-toc__toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', toc.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Content';
  aside.insertBefore(toggle, toc);

  entries.forEach(function (entry) {
    entry.link.parentElement.dataset.tocLevel = entry.heading.tagName.slice(1);
  });

  toggle.addEventListener('click', function () {
    const isOpen = aside.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  toc.addEventListener(
    'wheel',
    function (event) {
      if (toc.scrollHeight <= toc.clientHeight) return;

      const multiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? toc.clientHeight
          : 1;

      event.preventDefault();
      event.stopPropagation();
      toc.scrollTop += event.deltaY * multiplier;
    },
    { passive: false },
  );

  let activeEntry = null;
  let updateFrame = null;

  function keepActiveLinkVisible(link) {
    const tocRect = toc.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padding = 8;

    if (linkRect.top < tocRect.top + padding) {
      toc.scrollTop -= tocRect.top + padding - linkRect.top;
    } else if (linkRect.bottom > tocRect.bottom - padding) {
      toc.scrollTop += linkRect.bottom - tocRect.bottom + padding;
    }
  }

  function setActiveEntry(nextEntry) {
    if (!nextEntry || nextEntry === activeEntry) return;

    if (activeEntry) {
      activeEntry.link.classList.remove('is-active');
      activeEntry.link.removeAttribute('aria-current');
    }

    activeEntry = nextEntry;
    activeEntry.link.classList.add('is-active');
    activeEntry.link.setAttribute('aria-current', 'location');
    keepActiveLinkVisible(activeEntry.link);
  }

  function updateActiveEntry() {
    updateFrame = null;
    const activationLine = 96;
    let nextEntry = entries[0];

    for (let index = 0; index < entries.length; index += 1) {
      if (entries[index].heading.getBoundingClientRect().top <= activationLine) {
        nextEntry = entries[index];
      } else {
        break;
      }
    }

    setActiveEntry(nextEntry);
  }

  function requestActiveEntryUpdate() {
    if (updateFrame !== null) return;
    updateFrame = window.requestAnimationFrame(updateActiveEntry);
  }

  entries.forEach(function (entry) {
    entry.link.addEventListener('click', function () {
      setActiveEntry(entry);
    });
  });

  window.addEventListener('scroll', requestActiveEntryUpdate, { passive: true });
  window.addEventListener('resize', requestActiveEntryUpdate);
  window.addEventListener('hashchange', requestActiveEntryUpdate);
  updateActiveEntry();
})();
