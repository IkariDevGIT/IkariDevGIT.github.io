import { readFileSync } from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const COLOR_BG = '#08031a';
const COLOR_CONTENT = '#250036';
const COLOR_BOX = '#13092d';
const COLOR_ACCENT = '#ed64f5';
const COLOR_ACCENT_GLOW = '#ff72f8c5';
const COLOR_TEXT = '#fceaff';
const COLOR_TEXT_FAINT = '#b6b0c8';

const font = (file: string) => readFileSync(path.join(process.cwd(), 'src/assets/fonts', file));
const fonts = [
  { name: 'Russo One', data: font('RussoOne-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Ambitsek', data: font('ambitsek.ttf'), weight: 400, style: 'normal' },
  { name: 'M PLUS Rounded 1c', data: font('MPLUSRounded1c-Regular.ttf'), weight: 400, style: 'normal' },
] as const;

const avatarBase64 = readFileSync(path.join(process.cwd(), 'src/assets/avatar.png')).toString('base64');
const avatarDataUri = `data:image/png;base64,${avatarBase64}`;

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; children?: unknown; [key: string]: unknown } };

function h(type: string, style: Style, children?: unknown, extra: Record<string, unknown> = {}): Node {
  return { type, props: { style, children, ...extra } };
}

function titleFontSize(title: string) {
  if (title.length <= 20) return 60;
  if (title.length <= 36) return 50;
  if (title.length <= 56) return 42;
  return 34;
}

export type OgTheme = 'default' | 'legacy' | 'repost';

const THEMES: Record<OgTheme, { accent: string; glow: string; content: string; halo: string }> = {
  default: { accent: COLOR_ACCENT, glow: COLOR_ACCENT_GLOW, content: COLOR_CONTENT, halo: '#4a006b' },
  legacy: { accent: '#f19bf6', glow: '#ff9ff8a8', content: '#3a0b4d', halo: '#5c2a70' },
  repost: { accent: '#7cc4ff', glow: '#7cc4ff8c', content: '#102844', halo: '#124a7a' },
};

export interface OgImageOptions {
  label: string;
  title: string;
  description: string;
  url: string;
  theme?: OgTheme;
}

function buildElement({ label, title, description, url, theme = 'default' }: OgImageOptions) {
  const fill: Style = { position: 'absolute', top: 0, left: 0, width: `${OG_WIDTH}px`, height: `${OG_HEIGHT}px` };
  const { accent, glow, content, halo } = THEMES[theme];

  return h(
    'div',
    { width: `${OG_WIDTH}px`, height: `${OG_HEIGHT}px`, display: 'flex', position: 'relative', backgroundColor: COLOR_BG },
    [
      h('div', { ...fill, backgroundImage: `radial-gradient(circle at 840px 300px, ${halo} 0%, ${COLOR_BG} 62%)` }),
      h('div', {
        ...fill,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.28) 0px, rgba(0, 0, 0, 0.28) 2px, transparent 2px, transparent 5px)',
      }),
      h('img', { position: 'absolute', left: '-40px', bottom: 0, objectFit: 'cover' }, undefined, {
        src: avatarDataUri,
        width: 500,
        height: 610,
      }),
      h(
        'div',
        {
          position: 'absolute',
          left: '470px',
          top: '44px',
          width: '680px',
          height: '530px',
          display: 'flex',
          flexDirection: 'column',
        },
        [
          h(
            'div',
            {
              fontFamily: 'Ambitsek',
              fontSize: '34px',
              color: accent,
              textShadow: `0 0 10px ${glow}, 0 0 24px ${glow}`,
              marginBottom: '30px',
            },
            'IkariDev',
          ),
          h(
            'div',
            {
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '44px 38px 30px',
              backgroundColor: content,
              border: `2px solid ${accent}`,
              boxShadow: `12px 12px 0 rgba(0, 0, 0, 0.78), 0 0 30px ${glow}`,
            },
            [
              h(
                'div',
                {
                  position: 'absolute',
                  top: '-20px',
                  left: '26px',
                  padding: '6px 14px',
                  fontFamily: 'Ambitsek',
                  fontSize: '22px',
                  color: COLOR_TEXT,
                  backgroundColor: COLOR_BOX,
                  border: `2px solid ${accent}`,
                  boxShadow: `0 0 12px ${glow}`,
                },
                label,
              ),
              h(
                'div',
                {
                  display: 'block',
                  lineClamp: 3,
                  fontFamily: 'Russo One',
                  fontSize: `${titleFontSize(title)}px`,
                  lineHeight: 1.2,
                  color: COLOR_TEXT,
                  textShadow: `0 0 10px ${glow}, 0 0 28px ${glow}`,
                },
                title,
              ),
              h('div', {
                height: '2px',
                margin: '26px 0 22px',
                backgroundImage: `linear-gradient(90deg, ${accent}, transparent)`,
              }),
              h(
                'div',
                {
                  display: 'block',
                  lineClamp: 4,
                  fontFamily: 'M PLUS Rounded 1c',
                  fontSize: '27px',
                  lineHeight: 1.45,
                  color: COLOR_TEXT_FAINT,
                },
                description,
              ),
              h(
                'div',
                { marginTop: 'auto', fontFamily: 'Russo One', fontSize: '22px', color: accent },
                url,
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export async function renderOgImage(options: OgImageOptions): Promise<Response> {
  const svg = await satori(buildElement(options) as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [...fonts],
  });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, effort: 10 }).toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}

export function ogImagePath(pathname: string): string {
  let key = pathname.replace(/^\/+|\/+$/g, '');
  if (key === '') key = 'index';
  if (/^blog(\/(oldest|latest-update|newest))?(\/\d+)?$/.test(key)) key = 'blog';
  return `/images/og/${key}.png`;
}
