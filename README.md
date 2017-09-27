# Panic-Button

An easier, modern approach to classroom dynamics to enable both students and teachers.

# Using Docker

The Dockerfile included makes deploying and testing the server-side standard on all platforms. This builds from the official Node Docker image, so all developers can deploy on a standardized version while also making cloud deployment much easier. You can continuously build new Docker images by running the following command:

```bash
docker build -t csi4999/panic-button .
```

After you have built the image you can start the application by running:

```bash
docker run -p 3000:3000 -d --name pb csi4999/panic-button
```

If you're clearing this image to make a new one, you can chain the following commands together to stop and remove the container, and remove the image:

```bash
docker stop pb; docker rm pb; docker rmi tcarrio/panic-button
```