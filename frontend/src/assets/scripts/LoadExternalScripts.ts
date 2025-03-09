export const loadScript = (src: string, async: boolean = true, defer: boolean = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // Le script est déjà chargé
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = async;
    script.defer = defer;
    script.onload = () => resolve(console.log(src+" Chargé"));
    script.onerror = () => reject(new Error(`Erreur lors du chargement du script : ${src}`));

    document.body.appendChild(script);
  });
};
