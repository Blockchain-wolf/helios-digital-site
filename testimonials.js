// Ajoute un objet ici pour chaque vrai avis client reçu.
// Tant que ce tableau est vide, la section "Ce que disent mes clients"
// reste automatiquement masquée (pas de faux avis affichés aux visiteurs).
//
// Exemple à copier/remplir :
// { name: "Prénom Nom", company: "Nom de l'entreprise", rating: 5, quote: "Un vrai retour client." },
const testimonials = [];

const testimonialsSection = document.getElementById('testimonials');
const testimonialsGrid = document.getElementById('testimonial-grid');
const testimonialsNavLink = document.querySelector('#nav-menu a[href="#testimonials"]');

if (testimonialsSection && testimonialsGrid) {
  if (testimonials.length === 0) {
    testimonialsSection.style.display = 'none';
    if (testimonialsNavLink) {
      testimonialsNavLink.style.display = 'none';
    }
  } else {
    testimonials.forEach((review) => {
      const card = document.createElement('article');
      card.className = 'testimonial-card';

      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('aria-label', `${review.rating} étoiles sur 5`);
      stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

      const quote = document.createElement('p');
      quote.textContent = `« ${review.quote} »`;

      const author = document.createElement('p');
      author.className = 'testimonial-author';
      author.textContent = review.company ? `— ${review.name}, ${review.company}` : `— ${review.name}`;

      card.append(stars, quote, author);
      testimonialsGrid.appendChild(card);
    });
  }
}
