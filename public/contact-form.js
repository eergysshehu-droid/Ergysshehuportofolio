(() => {
  const form =
    document.querySelector(
      '#inquiry'
    );

  if (
    !form ||
    form.dataset.contactEnhanced ===
      'true'
  ) {
    return;
  }

  form.dataset.contactEnhanced =
    'true';

  const status =
    form.querySelector(
      '[data-form-status]'
    );

  const submit =
    form.querySelector(
      'button[type="submit"]'
    );

  const project =
    form.querySelector(
      '[name="project"]'
    );

  const honeypot =
    document.createElement(
      'input'
    );

  honeypot.type =
    'text';

  honeypot.name =
    'website';

  honeypot.autocomplete =
    'off';

  honeypot.tabIndex =
    -1;

  honeypot.setAttribute(
    'aria-hidden',
    'true'
  );

  Object.assign(
    honeypot.style,
    {
      position:
        'absolute',

      left:
        '-10000px',

      top:
        'auto',

      width:
        '1px',

      height:
        '1px',

      overflow:
        'hidden',

      opacity:
        '0',

      pointerEvents:
        'none'
    }
  );

  form.appendChild(
    honeypot
  );

  let startedAt =
    Date.now();

  let sending =
    false;

  function currentLang() {
    return document
      .documentElement
      .lang ===
      'sq'
      ? 'sq'
      : 'en';
  }

  function setStatus(
    text,
    type =
      'normal'
  ) {
    if (
      !status
    ) {
      return;
    }

    status.hidden =
      false;

    status.textContent =
      text;

    status.dataset.state =
      type;

    status.classList.toggle(
      'is-fallback',
      type ===
        'error'
    );
  }

  function clearStatus() {
    if (
      !status
    ) {
      return;
    }

    status.hidden =
      true;

    status.textContent =
      '';

    delete status.dataset.state;

    status.classList.remove(
      'is-fallback'
    );
  }

  function setBusy(
    busy
  ) {
    sending =
      busy;

    form.setAttribute(
      'aria-busy',
      String(
        busy
      )
    );

    if (
      !submit
    ) {
      return;
    }

    submit.disabled =
      busy;

    submit.setAttribute(
      'aria-busy',
      String(
        busy
      )
    );

    submit.style.opacity =
      busy
        ? '.62'
        : '';

    submit.style.cursor =
      busy
        ? 'wait'
        : '';
  }

  form.addEventListener(
    'input',
    () => {
      if (
        !sending &&
        status?.dataset.state ===
          'error'
      ) {
        clearStatus();
      }
    }
  );

  /*
   * Capture phase is intentional.
   * It intercepts the original static mailto fallback before
   * the older target submit handler can run.
   */
  document.addEventListener(
    'submit',

    async event => {
      if (
        event.target !==
        form
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (
        sending
      ) {
        return;
      }

      if (
        !form.checkValidity()
      ) {
        form.reportValidity();
        return;
      }

      const lang =
        currentLang();

      const data =
        new FormData(
          form
        );

      const payload = {
        name:
          String(
            data.get(
              'name'
            ) ||
            ''
          ),

        email:
          String(
            data.get(
              'email'
            ) ||
            ''
          ),

        phone:
          String(
            data.get(
              'phone'
            ) ||
            ''
          ),

        project:
          String(
            data.get(
              'project'
            ) ||
            ''
          ),

        message:
          String(
            data.get(
              'message'
            ) ||
            ''
          ),

        website:
          String(
            data.get(
              'website'
            ) ||
            ''
          ),

        lang,

        startedAt,

        page:
          window.location.pathname
      };

      setBusy(
        true
      );

      setStatus(
        lang ===
          'sq'
          ? 'Duke dërguar mesazhin…'
          : 'Sending your message…',
        'sending'
      );

      const controller =
        new AbortController();

      const timeout =
        window.setTimeout(
          () =>
            controller.abort(),
          15000
        );

      try {
        const response =
          await fetch(
            '/api/contact',
            {
              method:
                'POST',

              credentials:
                'same-origin',

              headers: {
                'content-type':
                  'application/json',

                accept:
                  'application/json'
              },

              body:
                JSON.stringify(
                  payload
                ),

              signal:
                controller.signal
            }
          );

        const result =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (
          !response.ok ||
          !result.ok
        ) {
          throw new Error(
            result.error ||
            (
              lang === 'sq'
                ? 'Mesazhi nuk u dërgua.'
                : 'The message could not be sent.'
            )
          );
        }

        form.reset();

        startedAt =
          Date.now();

        if (
          project
        ) {
          project.value =
            '';
        }

        setStatus(
          lang ===
            'sq'
            ? 'Mesazhi u dërgua. Do të të përgjigjem sa më shpejt.'
            : 'Message sent. I’ll get back to you as soon as possible.',
          'success'
        );
      } catch (
        error
      ) {
        console.error(
          'Contact form:',
          error
        );

        const isAbort =
          error instanceof DOMException &&
          error.name ===
            'AbortError';

        const serverMessage =
          error instanceof Error
            ? error.message
            : '';

        setStatus(
          isAbort
            ? (
                lang ===
                  'sq'
                  ? 'Dërgimi po zgjat shumë. Kontrollo lidhjen dhe provo përsëri.'
                  : 'Sending took too long. Check your connection and try again.'
              )
            : (
                serverMessage ||
                (
                  lang === 'sq'
                    ? 'Mesazhi nuk u dërgua. Provo përsëri ose më shkruaj në e.ergysshehu@gmail.com.'
                    : 'The message could not be sent. Please try again or email e.ergysshehu@gmail.com.'
                )
              ),
          'error'
        );
      } finally {
        window.clearTimeout(
          timeout
        );

        setBusy(
          false
        );
      }
    },

    true
  );
})();
