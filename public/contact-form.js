(() => {
  const form =
    document.querySelector(
      '#inquiry'
    );

  if (
    !form
  ) {
    return;
  }

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

  function lang() {
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

    status.classList
      .toggle(
        'is-fallback',
        type ===
          'error'
      );
  }

  function setBusy(
    busy
  ) {
    if (
      submit
    ) {
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
  }

  /*
   * Capture phase is intentional:
   * the old mailto handler remains as a safe fallback in the static HTML,
   * but when this Worker-powered enhancement is present it gets intercepted
   * before the old target listener can run.
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
        !form.checkValidity()
      ) {
        form.reportValidity();

        return;
      }

      const currentLang =
        lang();

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

        lang:
          currentLang,

        startedAt,

        page:
          window
            .location
            .pathname
      };

      setBusy(
        true
      );

      setStatus(
        currentLang ===
          'sq'
          ? 'Duke dërguar mesazhin…'
          : 'Sending your message…'
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
                )
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
            'Send failed'
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
          currentLang ===
            'sq'
            ? 'Mesazhi u dërgua. Do të të përgjigjem sa më shpejt.'
            : 'Message sent. I’ll get back to you as soon as possible.'
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setStatus(
          currentLang ===
            'sq'
            ? 'Mesazhi nuk u dërgua. Provo përsëri ose më shkruaj në e.ergysshehu@gmail.com.'
            : 'The message could not be sent. Please try again or email e.ergysshehu@gmail.com.',
          'error'
        );
      } finally {
        setBusy(
          false
        );
      }
    },

    true
  );
})();
