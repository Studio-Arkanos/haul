#!/usr/bin/env python3
"""
Génère les livrables numériques PLACEHOLDER de la boutique Haul.

Les vrais produits (PDF du Guide, Pack Figma complet, etc.) doivent être
déposés dans le bucket Supabase privé « digital-products » — ces fichiers
servent de repli local en développement (storage/digital/, gitignored).

Usage :
    python3 -m venv /tmp/pdfenv && /tmp/pdfenv/bin/pip install fpdf2
    /tmp/pdfenv/bin/python scripts/generate_placeholders.py
"""
import textwrap
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent.parent / "storage" / "digital"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = (10, 18, 32)
ORANGE = (232, 93, 4)
CREAM = (244, 241, 234)
STEEL = (168, 188, 208)


class HaulPDF(FPDF):
    def header(self):
        self.set_fill_color(*NAVY)
        self.rect(0, 0, 210, 18, "F")
        self.set_text_color(*ORANGE)
        self.set_font("helvetica", "B", 11)
        self.set_xy(10, 5)
        self.cell(0, 8, "HAUL - STUDIO ARKOS", align="L")
        self.set_text_color(*STEEL)
        self.cell(0, 8, "TOUT CE QUI DOIT ARRIVER", align="R")
        self.set_x(10)
        self.ln(18)
        self.set_x(10)

    def footer(self):
        self.set_y(-12)
        self.set_text_color(120, 132, 148)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 8, f"Haul - Studio Arkanos - Livre pour son acheteur - page {self.page_no()}/{{nb}}", align="C")

    def cover(self, eyebrow: str, title: str, subtitle: str):
        self.add_page()
        self.set_x(10)
        self.ln(20)
        self.set_x(10)
        self.set_text_color(*ORANGE)
        self.set_font("helvetica", "B", 11)
        self.set_x(10)
        self.multi_cell(0, 7, eyebrow.upper(), align="L")
        self.ln(6)
        self.set_text_color(*NAVY)
        self.set_font("helvetica", "B", 34)
        self.set_x(10)
        self.multi_cell(0, 15, title)
        self.ln(8)
        self.set_draw_color(*ORANGE)
        self.set_line_width(1.2)
        self.line(10, self.get_y(), 60, self.get_y())
        self.ln(8)
        self.set_text_color(60, 74, 92)
        self.set_font("helvetica", "", 14)
        self.set_x(10)
        self.multi_cell(0, 9, subtitle)

    def chapter(self, num: str, title: str):
        self.add_page()
        self.set_x(10)
        self.set_text_color(*ORANGE)
        self.set_font("helvetica", "B", 12)
        self.set_x(10)
        self.multi_cell(0, 7, f"CHAPITRE {num}")
        self.set_text_color(*NAVY)
        self.set_font("helvetica", "B", 24)
        self.set_x(10)
        self.multi_cell(0, 12, title)
        self.ln(6)

    def body(self, text: str):
        self.set_x(10)
        self.set_text_color(45, 56, 72)
        self.set_font("helvetica", "", 11)
        for para in text.strip().split("\n\n"):
            self.set_x(10)
            self.multi_cell(0, 7.2, para.strip())
            self.ln(3)

    def bullets(self, items):
        self.set_text_color(45, 56, 72)
        self.set_font("helvetica", "", 11)
        for item in items:
            self.set_x(14)
            self.set_text_color(*ORANGE)
            self.cell(6, 7, "-")
            self.set_text_color(45, 56, 72)
            self.multi_cell(0, 7, item)
        self.ln(2)


def guide_dropshipping():
    pdf = HaulPDF(format="A4")
    pdf.alias_nb_pages()
    pdf.cover(
        "Guide digital - PDF + checklists",
        "Guide\nDropshipping 2026",
        "La methode terrain du Studio Arkanos : trouver sa niche, choisir ses fournisseurs, "
        "lancer ses premieres pubs et lire ses chiffres sans se noyer.",
    )

    pdf.chapter("01", "Le diagnostic avant le demarrage")
    pdf.body(
        "Le dropshipping n'est pas une loterie : c'est une suite de paris mesures. Avant de "
        "depenser le moindre euro en pub, reponds par ecrit a trois questions : quel probleme "
        "precis ce produit resout-il, pour qui, et pourquoi maintenant ?\n\n"
        "Un produit gagnant ne l'est jamais pour tout le monde. Il l'est pour une niche que tu "
        "peux decrire en une phrase : « les proprietaires de chats d'appartement depassant 5 kg », "
        "« les cuisiniers du dimanche qui cuisinent au wok ». Si ta niche tient en une phrase, "
        "ton positionnement tient debout."
    )

    pdf.chapter("02", "Choisir sa niche : grille en 6 points")
    pdf.bullets([
        "Douleur ou desir identifiable (gain de temps, confort, fierte, peur).",
        "Marge brute >= 3x le cout produit + livraison (paris gagnant : 4x).",
        "Frequence d'achat ou panier impulsif (< 60 EUR) OU abonnement naturel.",
        "Intention de recherche visible (Google Trends, TikTok search, Amazon).",
        "Concurrence faible a moyenne : evite les categories saturees par les marketplaces.",
        "Logistique simple : pas de fragile, pas de batterie lithium, pas de taille complexe.",
    ])
    pdf.body(
        "Score chaque critere sur 2. En dessous de 9/12, retourne a l'etape precedente. Un bon "
        "produit mediocrement vendu bat toujours un excellent produit mal positionne."
    )

    pdf.chapter("03", "Fournisseurs : les 4 profils")
    pdf.bullets([
        "Agent privé (Taobao/1688 + agent) : cout bas, qualite variable, exige echantillon.",
        "Plateforme (CJDropshipping, Zendrop) : qualite standardisee, couts plus eleves.",
        "Print on demand : marge stable, zero risque stock, ideal t-shirts/affiches (comme Haul).",
        "Fournisseur local (UE/Afrique de l'Ouest) : livraison rapide, argument massue vs AliExpress.",
    ])
    pdf.body(
        "Commande TOUJOURS un echantillon avant de lancer. Photographie-le, pese-le, chronometre "
        "la livraison. Ta fiche produit s'ecrit avec ces preuves, pas avec celles du fournisseur."
    )

    pdf.chapter("04", "Pub Meta et TikTok : le minimum viable")
    pdf.bullets([
        "Budget de test : 20-30 EUR/jour pendant 5-7 jours, jamais plus avant d'avoir des donnees.",
        "3 creatives differentes minimum (hook hygiene, probleme/solution, preuve sociale).",
        "Une seule variable testee a la fois : hook, audience ou page produit.",
        "Coupe a 2x le CPA cible sans vente ; scale ce qui passe a 1.5x le CPA cible.",
        "TikTok organique d'abord : 1 video/jour pendant 30 jours avant d'injecter du budget.",
    ])

    pdf.chapter("05", "Lecture des chiffres")
    pdf.body(
        "Trois nombres pilotent la boutique : le CPA (cout d'acquisition), la marge de contribution "
        "par commande, et le taux de remboursement. Tant que la marge apres pub et logistique est "
        "positive, tu peux acheter du volume. Tant qu'elle est negative, le volume aggrave la perte.\n\n"
        "Objectif semaine 1 : 10 commandes, quel que soit le profit. Tu achetes des donnees. "
        "Objectif semaine 2 : CPA sous 40% de la marge. Objectif mois 1 : 50 commandes et un taux "
        "de remboursement sous 3%."
    )

    pdf.chapter("06", "Les 8 erreurs qui coutent cher")
    pdf.bullets([
        "Se lancer sans echantillon et decouvrir les defauts via les remboursements.",
        "Choisir un produit a marge < 30% en pensant volume compensera.",
        "Copier les creatives des autres boutiques sans les adapter a sa niche.",
        "Paniquer et tout couper a J+2 au lieu d'attendre la significativite statistique.",
        "Ignorer le SAV : 48h sans reponse = litige = compte Stripe restreint.",
        "Croire aux screenshots de revenus : ne montrer que les siens.",
        "Monter 10 boutiques en parallele au lieu d'en finir une.",
        "Negliger les 25% de clients qui achetent un deuxieme produit.",
    ])

    pdf.chapter("07", "Roadmap 30 jours")
    pdf.bullets([
        "J1-J3 : recherche niche, grille 6 points, shortlist 3 produits.",
        "J4-J6 : echantillons commandes, veille creatives TikTok/Meta.",
        "J7-J10 : boutique Haul (page, paiement Stripe, emails transactionnels).",
        "J11-J14 : contenu organique, 1 video/jour, collecte d'emails (10% de reduction).",
        "J15-J21 : test pub 20-30 EUR/jour, 3 creatives, coupe/scale rapide.",
        "J22-J26 : optimisation page produit (FAQ, reassurance, avis).",
        "J27-J30 : bilan chiffres, decision scale ou pivot de niche.",
    ])
    pdf.body(
        "Ce guide est un exemplaire de demonstration du Studio Arkanos. La version complete "
        "inclut les checklists PDF imprimeables, les trames de briefs fournisseurs et la bibliotheque "
        "de creatives. Support : support@arkanos.studio ou GitHub Issues du projet haul."
    )

    pdf.output(str(OUT / "guide-dropshipping-2026.pdf"))


def ebook_lance_ta_boutique():
    pdf = HaulPDF(format="A4")
    pdf.alias_nb_pages()
    pdf.cover(
        "Ebook - Plan 14 jours",
        "Lance ta\nboutique",
        "Le plan jour par jour pour mettre en ligne ta premiere boutique rentable - sans stock, "
        "sans code, sans jargon.",
    )

    pdf.chapter("01", "Jours 1 a 3 - La promesse")
    pdf.body(
        "Avant toute technique, ecris ta promesse en une phrase : « J'aide X a obtenir Y sans Z ». "
        "Exemples : « J'aide les cuisiniers debutants a reussir leurs woks sans recettes ratees ». "
        "Cette phrase pilote tout le reste : nom, niche, page, pubs.\n\n"
        "Ensuite, liste 20 personnes qui te disent brutalement la verite (amis, famille, "
        "communautes). Ce sont tes 20 premiers clients potentiels et ton premier focus group."
    )

    pdf.chapter("02", "Jours 4 a 6 - Le produit")
    pdf.body(
        "Choisis UN produit pour commencer. Pas une gamme. Pas un catalogue. Un. Applique la "
        "grille 6 points du Guide Dropshipping 2026 si tu en doutes. Verifie la marge reelle : "
        "produit + livraison + frais Stripe (1,5% + 0,25 EUR environ) + pub = ta vraie marge."
    )

    pdf.chapter("03", "Jours 7 a 9 - La boutique")
    pdf.bullets([
        "Une page produit parfaite : promesse, 3 visuels, 3 avis, FAQ, reassurance livraison.",
        "Paiement Stripe Checkout : aucune donnee bancaire ne transite par chez toi.",
        "Pages legales obligatoires : mentions, retours 14 jours, confidentialite.",
        "Emails transactionnels : confirmation, expedition avec suivi, remerciement J+7.",
    ])

    pdf.chapter("04", "Jours 10 a 12 - Le contenu")
    pdf.body(
        "Publie 1 contenu par jour pendant toute la vie de ta boutique. Format gagnant sur "
        "TikTok/Reels : hook (question/coupe franche) + demonstration reelle + preuve (avant/apres, "
        "avis) + appel a l'action simple. Pas de voix off corporate : ton telephone, ta table, ta voix."
    )

    pdf.chapter("05", "Jours 13 a 14 - Le lancement")
    pdf.bullets([
        "J-1 : test complet en mode Stripe Test (paiement, emails, webhook, livraison).",
        "Jour J : annonce a ta liste de 20 personnes, offre de lancement -20% 48h.",
        "J+1 a J+14 : un contenu/jour, relance non-acheteurs, remercie chaque client personnellement.",
    ])
    pdf.body(
        "Ta premiere vente est la plus dure. Elle valide la chaine complete : promesse, page, "
        "paiement, livraison. Apres ca, tu n'as plus qu'a vendre - tout le reste est deja prouve."
    )

    pdf.output(str(OUT / "ebook-lance-ta-boutique.pdf"))


def pack_templates():
    pdf = HaulPDF(format="A4")
    pdf.alias_nb_pages()
    pdf.cover(
        "Pack digital - 25 templates",
        "Pack 25\nTemplates\nE-commerce",
        "Landing pages, fiches produit, sequences email et tableaux de bord - la panoplie "
        "complete du lancement e-commerce, prete a l'emploi.",
    )

    pdf.chapter("01", "Contenu du pack")
    pdf.bullets([
        "6 landing pages Figma (lead magnet, precommande, liste d'attente, offre flash, upsell, remerciement).",
        "5 fiches produits (electronique, mode, maison, alimentaire, beaute) avec structure AIDA.",
        "4 sequences email (welcome 5, post-achat 4, relance panier 3, win-back 2).",
        "4 tableaux de bord Notion (P&L hebdo, suivi fournisseurs, planning contenu, SAV).",
        "6 grilles de prix / bundles (produit seul, duo, pack avec livraison offerte, precommande, retour illimite).",
    ])

    pdf.chapter("02", "Comment utiliser le pack")
    pdf.body(
        "Chaque template est dupliqué, pas modifié. Duplique la page, remplace les visuels et les "
        "textes par les tiens, publie. Le design est volontairement sobre : navy, acier, un seul "
        "accent couleur (orange) - la marque c'est toi, pas le template."
    )

    pdf.chapter("03", "Mises a jour")
    pdf.body(
        "Le pack est mis a jour gratuitement a vie. Les mises a jour arrivent sur le lien de "
        "telechargement personnel fourni apres achat - conserve ton email de confirmation. "
        "Version actuelle : Pack 2026.2 (novembre)."
    )

    pdf.output(str(OUT / "pack-templates-ecommerce.pdf"))


if __name__ == "__main__":
    guide_dropshipping()
    ebook_lance_ta_boutique()
    pack_templates()
    print("Livrables generes dans", OUT)
