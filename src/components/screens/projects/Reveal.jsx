import { useEffect } from 'react';
import Reveal from 'reveal.js';
import sanitizeHtml from 'sanitize-html';

import '/node_modules/reveal.js/dist/reveal.css';
import '/node_modules/reveal.js/dist/theme/white.css';

export function Presentation(props) {
  
  useEffect(() => {
    let deck = new Reveal({
      backgroundTransition: 'slide',
      transition: 'slide',
    });
    deck.initialize();
  }, []);

  function sanitize(html) {
    return sanitizeHtml(html, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a', "h1", "h2", "h3", "h4",
      "h5", "h6", "hr", "li", "ol", "p", "ul", "code", 'u' ],
      allowedAttributes: {
        'a': [ 'href' ],
        'img': [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading' ]
      },
      allowedIframeHostnames: ['www.youtube.com'],
      allowedSchemes: [ 'http', 'https' ],
      enforceHtmlBoundary: true
    });
  }

  return (
    <div className="reveal" style={{ height: "100vh" }}>
      <div className="slides absolute" data-transition="slide">
        {props.slides.map((slide, index) => (
          <section key={index} data-transition="slide">
            <div dangerouslySetInnerHTML={{ __html: sanitize(slide.content) }}></div>
          </section>
        ))}
      </div>
    </div>
  );
}
