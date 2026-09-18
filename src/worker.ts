interface EmailBinding {
  send(
    message: {
      to: string;

      from:
        | string
        | {
            email: string;
            name?: string;
          };

      subject: string;

      html?: string;
      text?: string;

      replyTo?:
        | string
        | {
            email: string;
            name?: string;
          };
    }
  ): Promise<{
    messageId?: string;
  }>;
}


interface AssetsBinding {
  fetch(
    request: Request
  ): Promise<Response>;
}


interface Env {
  CONTACT_EMAIL:
    EmailBinding;

  ASSETS:
    AssetsBinding;
}


interface ContactPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  project?: unknown;
  message?: unknown;
  lang?: unknown;
  website?: unknown;
  startedAt?: unknown;
  page?: unknown;
}


const DESTINATION_EMAIL =
  'e.ergysshehu@gmail.com';


const SENDER_EMAIL =
  'website@ergysshehu.com';


const MAX_BODY_BYTES =
  20000;


const PROJECTS = {
  fashion: {
    en:
      'Fashion Photography',

    sq:
      'Fotografi e Modës'
  },

  wedding: {
    en:
      'Wedding Photography & Video',

    sq:
      'Fotografi dhe Video Dasmash'
  },

  music: {
    en:
      'Music Video',

    sq:
      'Videoklip'
  },

  portrait: {
    en:
      'Portrait Photography',

    sq:
      'Fotografi Portretesh'
  },

  commercial: {
    en:
      'Commercial / Brand',

    sq:
      'Komerciale / Marka'
  },

  collaboration: {
    en:
      'Collaboration',

    sq:
      'Bashkëpunim'
  },

  other: {
    en:
      'Other',

    sq:
      'Tjetër'
  }
} as const;


type ProjectKey =
  keyof typeof PROJECTS;


type SiteLanguage =
  | 'en'
  | 'sq';


function json(
  body: Record<
    string,
    unknown
  >,
  status = 200
) {
  return new Response(
    JSON.stringify(
      body
    ),
    {
      status,

      headers: {
        'content-type':
          'application/json; charset=UTF-8',

        'cache-control':
          'no-store'
      }
    }
  );
}


function clean(
  value: unknown,
  maxLength: number
) {
  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  return value
    .trim()
    .replace(
      /\u0000/g,
      ''
    )
    .slice(
      0,
      maxLength
    );
}


function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}


function validEmail(
  value: string
) {
  return (
    value.length <=
      160 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        value
      )
  );
}


function validPhone(
  value: string
) {
  if (
    !value
  ) {
    return true;
  }

  return /^[0-9+\s()./-]{5,40}$/
    .test(
      value
    );
}


/*
 * JSON.parse() can legally return:
 *
 * null
 * number
 * string
 * array
 *
 * None of those are valid form payloads.
 */
function isContactPayload(
  value: unknown
): value is ContactPayload {

  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


/*
 * Do not use:
 *
 * PROJECTS[value]
 *
 * as the only validator because inherited Object keys
 * such as "constructor" must never be accepted as
 * legitimate project values.
 */
function isProjectKey(
  value: string
): value is ProjectKey {

  return Object
    .prototype
    .hasOwnProperty
    .call(
      PROJECTS,
      value
    );
}


async function handleContact(
  request: Request,
  env: Env
) {
  if (
    request.method !==
    'POST'
  ) {
    return json(
      {
        ok:
          false,

        error:
          'Method not allowed.'
      },
      405
    );
  }


  const url =
    new URL(
      request.url
    );


  const origin =
    request.headers.get(
      'origin'
    );


  if (
    origin
  ) {
    const allowedOrigins =
      new Set([
        url.origin,
        'https://ergysshehu.com',
        'https://www.ergysshehu.com'
      ]);

    if (
      !allowedOrigins.has(
        origin
      )
    ) {
      return json(
        {
          ok:
            false,

          error:
            'Invalid origin.'
        },
        403
      );
    }
  }


  const contentType =
    (
      request.headers.get(
        'content-type'
      ) ||
      ''
    ).toLowerCase();


  if (
    !contentType.includes(
      'application/json'
    )
  ) {
    return json(
      {
        ok:
          false,

        error:
          'Invalid request.'
      },
      415
    );
  }


  const contentLength =
    Number(
      request.headers.get(
        'content-length'
      ) ||
      '0'
    );


  if (
    Number.isFinite(
      contentLength
    ) &&
    contentLength >
      MAX_BODY_BYTES
  ) {
    return json(
      {
        ok:
          false,

        error:
          'Request too large.'
      },
      413
    );
  }


  let parsed:
    unknown;


  try {
    const raw =
      await request.text();

    if (
      raw.length >
      MAX_BODY_BYTES
    ) {
      return json(
        {
          ok:
            false,

          error:
            'Request too large.'
        },
        413
      );
    }

    parsed =
      JSON.parse(
        raw
      );

  } catch {
    return json(
      {
        ok:
          false,

        error:
          'Invalid form data.'
      },
      400
    );
  }


  /*
   * Protect against valid JSON that is not an object.
   *
   * Examples:
   * null
   * []
   * "hello"
   * 123
   */
  if (
    !isContactPayload(
      parsed
    )
  ) {
    return json(
      {
        ok:
          false,

        error:
          'Invalid form data.'
      },
      400
    );
  }


  const payload =
    parsed;


  const honeypot =
    clean(
      payload.website,
      200
    );


  /*
   * Bots commonly fill every available field.
   * Pretend success instead of revealing the trap.
   */
  if (
    honeypot
  ) {
    return json({
      ok:
        true
    });
  }


  const name =
    clean(
      payload.name,
      80
    );


  const email =
    clean(
      payload.email,
      160
    )
      .toLowerCase();


  const phone =
    clean(
      payload.phone,
      40
    );


  const project =
    clean(
      payload.project,
      40
    );


  const message =
    clean(
      payload.message,
      4000
    );


  const lang:
    SiteLanguage =
      payload.lang ===
        'sq'
        ? 'sq'
        : 'en';


  const page =
    clean(
      payload.page,
      300
    );


  if (
    name.length <
    2
  ) {
    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Shkruaj emrin.'
            : 'Please enter your name.'
      },
      400
    );
  }


  if (
    !validEmail(
      email
    )
  ) {
    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Email-i nuk është i vlefshëm.'
            : 'Please enter a valid email address.'
      },
      400
    );
  }


  if (
    !validPhone(
      phone
    )
  ) {
    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Numri i telefonit nuk është i vlefshëm.'
            : 'Please enter a valid phone number.'
      },
      400
    );
  }


  if (
    !isProjectKey(
      project
    )
  ) {
    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Zgjidh llojin e projektit.'
            : 'Please select a project type.'
      },
      400
    );
  }


  if (
    message.length <
    10
  ) {
    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Shkruaj pak më shumë për projektin.'
            : 'Please tell me a little more about your project.'
      },
      400
    );
  }


  const startedAt =
    Number(
      payload.startedAt
    );


  /*
   * Very fast submissions are normally automated.
   * Preserve the existing silent-success behaviour.
   */
  if (
    Number.isFinite(
      startedAt
    ) &&
    startedAt >
      0 &&
    Date.now() -
      startedAt <
      700
  ) {
    return json({
      ok:
        true
    });
  }


  const projectLabel =
    PROJECTS[
      project
    ][lang];


  const timestamp =
    new Date()
      .toISOString();


  const subject =
    `Website inquiry — ${projectLabel} — ${name}`;


  const text = [
    'NEW WEBSITE INQUIRY',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Project: ${projectLabel}`,
    `Language: ${lang.toUpperCase()}`,
    `Page: ${page || '/book/'}`,
    `Received: ${timestamp}`,
    '',
    'MESSAGE',
    '',
    message
  ].join(
    '\n'
  );


  const html =
    `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f2ed;color:#171714;font-family:Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:40px 24px;">

    <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#77776e;margin-bottom:12px;">
      ERGYS SHEHU · WEBSITE INQUIRY
    </div>

    <h1 style="margin:0 0 30px;font-size:30px;line-height:1.15;font-weight:400;">
      ${escapeHtml(
        projectLabel
      )}
    </h1>

    <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;width:130px;color:#77776e;">
          Name
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            name
          )}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;color:#77776e;">
          Email
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            email
          )}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;color:#77776e;">
          Phone
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            phone ||
            'Not provided'
          )}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;color:#77776e;">
          Project
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            projectLabel
          )}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;color:#77776e;">
          Language
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            lang.toUpperCase()
          )}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 0;border-top:1px solid #d3d1c9;color:#77776e;">
          Page
        </td>

        <td style="padding:10px 0;border-top:1px solid #d3d1c9;">
          ${escapeHtml(
            page ||
            '/book/'
          )}
        </td>
      </tr>

    </table>

    <div style="margin-top:34px;padding-top:24px;border-top:1px solid #d3d1c9;">

      <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#77776e;margin-bottom:12px;">
        Message
      </div>

      <div style="white-space:pre-wrap;font-size:16px;line-height:1.75;">
        ${escapeHtml(
          message
        )}
      </div>

    </div>

    <div style="margin-top:40px;font-size:12px;color:#77776e;">
      Reply directly to this email to answer ${escapeHtml(
        name
      )}.
    </div>

  </div>
</body>
</html>
`;


  try {
    const result =
      await env
        .CONTACT_EMAIL
        .send({
          to:
            DESTINATION_EMAIL,

          from: {
            email:
              SENDER_EMAIL,

            name:
              'Ergys Shehu Website'
          },

          replyTo: {
            email,

            name
          },

          subject,

          html,

          text
        });


    return json({
      ok:
        true,

      messageId:
        result
          ?.messageId ||
        null
    });

  } catch (
    error
  ) {
    console.error(
      'Contact email failed',
      error
    );


    return json(
      {
        ok:
          false,

        error:
          lang ===
            'sq'
            ? 'Mesazhi nuk u dërgua. Provo përsëri pas pak.'
            : 'The message could not be sent. Please try again shortly.'
      },
      500
    );
  }
}


class ContactScriptInjector {
  element(
    element: {
      append(
        content: string,
        options?: {
          html?: boolean;
        }
      ): void;
    }
  ) {
    element.append(
      '<script src="/contact-form.js" defer></script>',
      {
        html:
          true
      }
    );
  }
}


export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    const url =
      new URL(
        request.url
      );


    if (
      url.pathname ===
      '/api/contact'
    ) {
      return handleContact(
        request,
        env
      );
    }


    const isBookPage =
      url.pathname ===
        '/book/' ||
      url.pathname ===
        '/book' ||
      url.pathname ===
        '/sq/book/' ||
      url.pathname ===
        '/sq/book';


    if (
      isBookPage &&
      request.method ===
        'GET'
    ) {
      const response =
        await env
          .ASSETS
          .fetch(
            request
          );


      const contentType =
        response.headers.get(
          'content-type'
        ) ||
        '';


      if (
        contentType.includes(
          'text/html'
        )
      ) {
        return new HTMLRewriter()
          .on(
            'body',
            new ContactScriptInjector()
          )
          .transform(
            response
          );
      }


      return response;
    }


    return env
      .ASSETS
      .fetch(
        request
      );
  }
};
