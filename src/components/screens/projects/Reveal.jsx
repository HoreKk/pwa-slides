import { useEffect } from 'react';
import Reveal from 'reveal.js';

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

  return (
    <div className="reveal" style={{ height: '100vh' }}>
      <div className="slides absolute" data-transition="slide">
        {props.slides.map((slide, index) => (
          <section key={index} data-transition="slide">
            <div dangerouslySetInnerHTML={{ __html: slide.content }}></div>
          </section>
        ))}
      </div>
    </div>
  );
}
