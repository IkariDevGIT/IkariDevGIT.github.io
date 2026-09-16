export function personJsonLd(site: URL | undefined, description: string, image?: string) {
  const base = site?.toString() ?? '';
  const undi = {
    '@type': 'Person',
    name: 'Undi95',
    alternateName: 'Undi',
    sameAs: ['https://huggingface.co/Undi95', 'https://github.com/Undi95'],
  };

  return {
    '@type': 'Person',
    '@id': `${base}#ikari`,
    name: 'IkariDev',
    alternateName: ['Ikari', 'ikaridev'],
    url: base,
    description,
    ...(image ? { image: new URL(image, site).toString() } : {}),
    knowsAbout: [
      'Machine learning',
      'Large language models',
      'LLM finetuning',
      'Model merging',
      'Roleplay and language models',
      'Dataset creation and cleaning',
      'Model quantization',
      'Stable diffusion',
      'Image upscaling',
      'Game modding',
      'Unity modding',
      'My Dystopian Robot Girlfriend modding',
      'C#',
      'Python',
      'Rust',
      'TypeScript',
      'Web development',
      'Static site generators',
      'Data archiving',
      'Anime',
    ],
    memberOf: {
      '@type': 'Organization',
      '@id': 'https://huggingface.co/NeverSleep#organization',
      name: 'NeverSleep',
      alternateName: 'Never Sleep',
      url: 'https://huggingface.co/NeverSleep',
      sameAs: ['https://huggingface.co/NeverSleep', 'https://huggingface.co/NeverSleepHistorical'],
      member: [{ '@id': `${base}#ikari` }, undi],
    },
    knows: undi,
    sameAs: [
      'https://huggingface.co/IkariDev',
      'https://github.com/IkariDevGIT',
      'https://ikaridev.itch.io/',
      'https://civitai.com/user/ikaridev',
      'https://x.com/IkariDev_tw',
    ],
  };
}
