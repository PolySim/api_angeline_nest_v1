#!/bin/bash

# Définir les paramètres de l'image Docker
IMAGE_NAME="ghcr.io/polysim/portfolio_ad_nest"
TAG="latest"

# Construire l'image Docker
echo "Building Docker image ${IMAGE_NAME}:${TAG}..."
docker build . --platform linux/amd64 -t ${IMAGE_NAME}:${TAG}

# Vérifier si la construction a réussi
if [ $? -ne 0 ]; then
    echo "Erreur lors de la construction de l'image Docker."
    exit 1
fi

# Taguer l'image avec le registre Docker

# Pousser l'image vers le registre Docker
echo "Pushing Docker image ${IMAGE_NAME}:${TAG}..."
docker push ${IMAGE_NAME}:${TAG}

# Vérifier si le push a réussi
if [ $? -ne 0 ]; then
    echo "Erreur lors du push de l'image Docker."
    exit 1
fi

echo "L'image Docker ${IMAGE_NAME}:${TAG} a été poussée avec succès."

exit 0
