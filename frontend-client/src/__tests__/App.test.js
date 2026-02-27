import { render, screen } from '@testing-library/react';
import App from '../App';

test('affiche la barre de navigation', () => {
  render(<App />);
  expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
  expect(screen.getByText(/Produits/i)).toBeInTheDocument();
  expect(screen.getByText(/Panier/i)).toBeInTheDocument();
});
