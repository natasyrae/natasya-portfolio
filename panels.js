(() => {
  'use strict';

  const email = 'natasyasuryanto06@gmail.com';
  const projects = [
    ['TiketIn', 'March–April 2025', 'Train ticket booking', 'Passengers can search by travel class, reserve a ticket and print a receipt. I used PHP to generate tickets and MySQL to store passenger and booking records.', ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL']],
    ['FastBite', 'January 2025', 'Franchise landing page', 'I designed a responsive site where prospective partners can meet the company, compare franchise packages and get in touch. A carousel introduces the offers on the homepage.', ['HTML', 'CSS', 'JavaScript']],
    ['Car rental website', 'November 2024', 'Front-end development', 'I built a rental page with an automotive video and an interactive vehicle selector. Visitors can pick a car to explore its details on desktop or mobile.', ['HTML', 'CSS', 'JavaScript']],
    ['Inventory web app', 'January–July 2024', 'Product and stock management', 'Users can add, edit and remove products, then find records in a searchable table. Stock levels persist in the browser, and line and bar charts show how inventory changes over time.', ['JavaScript', 'Bootstrap', 'Chart.js', 'DataTables', 'localStorage']],
    ['RSA encryption and decryption', 'June–July 2024', 'Cryptography', 'I built a learning tool that generates an RSA key pair. Users can enter a message, see its ciphertext and decrypt it again.', ['JavaScript', 'Tailwind CSS', 'Flowbite']],
    ['Mobile banking prototype', 'February–March 2024', 'UI/UX design', 'I prototyped the journey from sign-in to account overview, transfers and transaction history. I used visual hierarchy to make the next step clear on each screen.', ['Figma', 'Prototyping']],
    ['Warehouse inventory system', 'August–November 2023', 'Stock tracking', 'I built forms for logging incoming and outgoing goods. A live chart reflects each change so users can see how much stock is available.', ['HTML', 'CSS', 'JavaScript', 'Chart.js']]
  ];

  const ui = {
    chongqing: ['Chongqing', 'About Me'],
    shanghai: ['Shanghai', 'My Projects'],
    harbin: ['Harbin', 'Education & Awards'],
    contact: ['', 'Get in Touch']
  };

  const chipList = items => '<ul class="pf-chips">' + items.map(item => '<li>' + item + '</li>').join('') + '</ul>';
  const section = (title, body) => '<section class="pf-section"><h3>' + title + '</h3>' + body + '</section>';
  const timeline = items => '<ul class="pf-timeline">' + items.map(([when, title, detail]) => '<li><span class="pf-date">' + when + '</span><strong>' + title + '</strong><p>' + detail + '</p></li>').join('') + '</ul>';
  const cv = '<a class="pf-button pf-primary" href="assets/Natasya-Suryanto-CV.pdf" download="CV-Natasya-Suryanto.pdf">Download CV (PDF)</a>';

  function profile() {
    return '<div class="pf-identity"><img alt="Pixel portrait of Natasya" src="assets/natasya-avatar.webp" width="80" height="80"><div><h3>Natasya Suryanto</h3><p>Software Engineering student<br>Nanjing Xiaozhuang University</p></div></div>' +
      '<p>I study software engineering in Nanjing and enjoy designing interfaces that make everyday tasks easier, from booking a train ticket to checking warehouse stock. Outside class, I follow the Indonesian stock market and use the data to practice spotting patterns.</p>' +
      section('Work experience', timeline([['2023 and 2024 · Part-time', 'Inventory management for Orang Tua', 'I built a web app to log food and beverage stock movements, recording the time and recipient of each delivery. The system tracked more than 200 items a day and reduced stock discrepancies by 30%.']]) + chipList(['HTML', 'CSS', 'JavaScript', 'PHP'])) +
      section('Skills', chipList(['Web development', 'Python', 'SQL & MySQL', 'Data visualization', 'UI/UX design', 'Technical documentation', 'Public relations'])) +
      section('Languages', '<dl class="pf-language"><div><dt>Indonesian</dt><dd>Native</dd></div><div><dt>English</dt><dd>Upper-intermediate · TOEFL 480</dd></div><div><dt>Mandarin Chinese</dt><dd>Intermediate</dd></div></dl>') +
      '<div class="pf-actions">' + cv + '</div>';
  }

  function portfolio() {
    return '<p class="pf-intro">Explore seven projects in interface design, front-end development and data management. Select a project to see how it works.</p><div class="pf-projects">' +
      projects.map(([title, date, category, description, tech], i) =>
        '<details class="pf-project"' + (i === 0 ? ' open' : '') + '><summary><span class="pf-project-type">' + category + '</span><strong>' + title + '</strong><span class="pf-expander" aria-hidden="true"></span></summary><div class="pf-project-body"><span class="pf-date">' + date + '</span><p>' + description + '</p>' + chipList(tech) + '</div></details>'
      ).join('') + '</div>';
  }

  function education() {
    return section('Education', timeline([
      ['2025–present', 'Nanjing Xiaozhuang University', 'Software Engineering · Nanjing, China'],
      ['2023–2025', 'Esa Unggul University', 'Informatics Engineering'],
      ['2020–2023', 'Santo Yoseph Senior High School', 'Science']
    ])) +
      section('Competitions & awards', timeline([
        ['November 2026', 'RAICOM 2026 · Global Security Track', 'As the English-language presenter for Team Zero-Pole Innovation, I gave a five-minute technical presentation about our robotics project to an international panel of university faculty.'],
        ['November 2026', 'Algorithm & AIGC Computer Design Competition', 'I narrated our team’s project video in English for the competition at Nanjing Xiaozhuang University.'],
        ['June 2026', 'Third prize · Algorithm & AIGC Computer Design Competition', 'I worked with 16 teammates from Indonesia and China on a computational design project using generative AI. We won third prize at Nanjing Xiaozhuang University.']
      ])) +
      section('Organizations', timeline([
        ['2026', 'Nanjing Suara Nusantara', 'Member, Funding and Sponsorship Division'],
        ['2024–2025', 'Google Developer Student Club · Esa Unggul University', 'Public Relations staff member'],
        ['2024–2025', 'Student Executive Board', 'Directorate of External Affairs']
      ])) +
      section('Dicoding certifications', '<ul class="pf-certificates"><li>Data Science <span>2024–2027</span></li>' +
        ['Basic Programming for Software Developer', 'Basic Structured Query Language (SQL)', 'Introduction to Python Programming', 'Fundamentals of Data Visualization', 'Fundamentals of Web Programming'].map(name => '<li>' + name + ' <span>2023–2026</span></li>').join('') + '</ul>');
  }

  function contact() {
    return '<div class="pf-identity"><img alt="Pixel portrait of Natasya" src="assets/natasya-avatar.webp" width="80" height="80"><div><h3>Natasya Suryanto</h3><p>Nanjing, China</p></div></div><p>I’m looking for an internship in tech. If you have an opportunity in web development or UI/UX design, I’d love to hear about it.</p><div class="pf-email"><a href="mailto:' + email + '">' + email + '</a><button class="pf-button" data-copy-email type="button">Copy email</button></div><div class="pf-actions"><a class="pf-button pf-primary" href="mailto:' + email + '">Send email</a>' + cv.replace(' pf-primary', '') + '</div><p class="pf-feedback" role="status"></p>';
  }

  const render = {chongqing: profile, shanghai: portfolio, harbin: education, contact};

  async function copyEmail(panel) {
    const feedback = panel.querySelector('.pf-feedback');
    try {
      await navigator.clipboard.writeText(email);
      feedback.textContent = 'Email address copied.';
    } catch {
      const field = document.createElement('textarea');
      field.setAttribute('readonly', '');
      field.value = email;
      field.className = 'pf-copy-input';
      panel.append(field);
      field.select();
      const copied = document.execCommand && document.execCommand('copy');
      field.remove();
      panel.querySelector('[data-copy-email]').focus();
      feedback.textContent = copied ? 'Email address copied.' : 'Select the email address above to copy it.';
    }
  }

  let initialized = false;

  window.openPortfolioPanel = function openPortfolioPanel(request) {
    const key = request === 'profile' ? 'chongqing' : request;
    if (!Object.hasOwn(render, key)) return;
    const dialog = document.getElementById('portfolioDialog');
    const panel = document.getElementById('portfolioPanel');
    if (!dialog || !panel) return;
    if (!initialized) {
      let backdropStart = false;
      const outside = event => {
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      };
      dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && outside(event); });
      dialog.addEventListener('click', event => {
        if (event.target === dialog && backdropStart && outside(event)) dialog.close();
        backdropStart = false;
      });
      panel.addEventListener('click', event => {
        if (event.target.closest('[data-close-panel]')) dialog.close();
        if (event.target.closest('[data-copy-email]')) copyEmail(panel);
      });
      initialized = true;
    }
    const [city, title] = ui[key];
    const location = key === 'contact' ? '' : '<span class="pf-location">' + city + '</span>';
    panel.innerHTML = '<header class="pf-header pf-' + key + '">' + location + '<h2 id="portfolioTitle" tabindex="-1">' + title + '</h2><button type="button" class="pf-close" data-close-panel aria-label="Close panel"><span aria-hidden="true">×</span></button></header><div class="pf-body">' + render[key]() + '</div>';
    if (!dialog.open) dialog.showModal();
    panel.querySelector('.pf-body').scrollTop = 0;
    panel.querySelector('h2').focus({preventScroll: true});
  };
})();
