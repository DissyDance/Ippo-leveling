/**
 * Configuration du fournisseur d'auth pour la validation des JWT côté Convex.
 *
 * PIÈGE STACK : `process` DOIT être déclaré en ambient ici. Sans cette
 * déclaration, `npx convex deploy` échoue en silence et les fonctions ne se
 * mettent pas à jour en production.
 */
declare const process: {
  env: {
    CONVEX_SITE_URL: string
  }
}

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: 'convex',
    },
  ],
}
