#!/usr/bin/env python3
"""
Script pour générer les icônes de l'application Go
Crée icon.png, adaptive-icon.png et splash-icon.png
"""

from PIL import Image, ImageDraw, ImageFont
import os


def create_go_icon(size, output_path, is_adaptive=False):
    """
    Crée une icône avec le texte 'Go' centré

    Args:
        size: Tuple (width, height) pour la taille de l'image
        output_path: Chemin où sauvegarder l'image
        is_adaptive: Si True, créé une icône adaptative avec transparence
    """
    # Créer une nouvelle image
    if is_adaptive:
        img = Image.new(
            "RGBA", size, (255, 255, 255, 0)
        )  # Fond transparent pour adaptive
    else:
        img = Image.new("RGBA", size, (255, 255, 255, 255))  # Fond blanc

    draw = ImageDraw.Draw(img)

    # Dessiner un cercle de fond avec un dégradé bleu/vert
    circle_color = (0, 122, 255, 255)  # Bleu iOS style
    margin = size[0] // 8 if not is_adaptive else 0

    # Pour l'icône adaptative, on remplit tout l'espace
    if is_adaptive:
        draw.ellipse([0, 0, size[0], size[1]], fill=circle_color)
    else:
        draw.ellipse(
            [margin, margin, size[0] - margin, size[1] - margin], fill=circle_color
        )

    # Calculer la taille de la police en fonction de la taille de l'image
    font_size = int(size[0] * 0.4)

    # Essayer d'utiliser une police système, sinon utiliser la police par défaut
    try:
        # Essayer différentes polices selon le système
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "C:\\Windows\\Fonts\\arialbd.ttf",
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break

        if font is None:
            # Utiliser la police par défaut si aucune police n'est trouvée
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Texte à afficher
    text = "Go"

    # Obtenir les dimensions du texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculer la position pour centrer le texte
    x = (size[0] - text_width) / 2 - bbox[0]
    y = (size[1] - text_height) / 2 - bbox[1]

    # Dessiner le texte en blanc
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    # Sauvegarder l'image
    img.save(output_path, "PNG")
    print(f"✓ Icône créée: {output_path}")


def create_splash_icon(size, output_path):
    """
    Crée une icône de splash screen

    Args:
        size: Tuple (width, height) pour la taille de l'image
        output_path: Chemin où sauvegarder l'image
    """
    # Créer une nouvelle image avec fond blanc
    img = Image.new("RGBA", size, (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Dessiner un cercle centré
    circle_color = (0, 122, 255, 255)
    circle_size = min(size[0], size[1]) // 2
    center_x = size[0] // 2
    center_y = size[1] // 2

    draw.ellipse(
        [
            center_x - circle_size // 2,
            center_y - circle_size // 2,
            center_x + circle_size // 2,
            center_y + circle_size // 2,
        ],
        fill=circle_color,
    )

    # Calculer la taille de la police
    font_size = int(circle_size * 0.4)

    # Essayer d'utiliser une police système
    try:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "C:\\Windows\\Fonts\\arialbd.ttf",
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break

        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Texte à afficher
    text = "Go"

    # Obtenir les dimensions du texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculer la position pour centrer le texte
    x = (size[0] - text_width) / 2 - bbox[0]
    y = (size[1] - text_height) / 2 - bbox[1]

    # Dessiner le texte en blanc
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    # Sauvegarder l'image
    img.save(output_path, "PNG")
    print(f"✓ Splash icon créée: {output_path}")


def main():
    """Fonction principale pour générer toutes les icônes"""

    # Déterminer le chemin du dossier assets/images
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    assets_dir = os.path.join(project_root, "assets", "images")

    # Créer le dossier assets/images s'il n'existe pas
    os.makedirs(assets_dir, exist_ok=True)

    print("🎨 Génération des icônes pour l'application Go...")
    print(f"📁 Dossier de destination: {assets_dir}\n")

    # Générer icon.png (1024x1024)
    icon_path = os.path.join(assets_dir, "icon.png")
    create_go_icon((1024, 1024), icon_path, is_adaptive=False)

    # Générer adaptive-icon.png (1024x1024)
    adaptive_icon_path = os.path.join(assets_dir, "adaptive-icon.png")
    create_go_icon((1024, 1024), adaptive_icon_path, is_adaptive=True)

    # Générer splash-icon.png (1242x2436)
    splash_icon_path = os.path.join(assets_dir, "splash-icon.png")
    create_splash_icon((1242, 2436), splash_icon_path)

    # Générer également favicon.png (48x48) pour le web
    favicon_path = os.path.join(assets_dir, "favicon.png")
    create_go_icon((48, 48), favicon_path, is_adaptive=False)

    print("\n✅ Toutes les icônes ont été générées avec succès!")
    print(
        "🚀 Vous pouvez maintenant compiler votre APK avec: eas build -p android --profile preview"
    )


if __name__ == "__main__":
    main()
