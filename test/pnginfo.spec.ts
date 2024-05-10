//@noUnusedParameters:false
/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="expect" />

import { basename, extname } from 'path';
import { newDefaultSettings } from '../src/util/newDefaultSettings';
import { splitSmartly } from '../src/index';

beforeAll(async () =>
{

});

describe(basename(__filename, extname(__filename)), () =>
{

	test.skip(`dummy`, () => {});

	test(`test`, () =>
	{
		let input = `Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 557152044, Size: 512x768, Model hash: 5307b134ff, Model: geminixMixRealistic_bV10, VAE hash: df3c506e51, VAE: kl-f8-anime2.ckpt, ADetailer model: face_yolov8n_v2.pt, ADetailer prompt: "(otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), (perfect face, beautiful face, perfect lips, perfect mouth, perfect detailed leg, beautiful detailed leg, perfect accurate limb, perfect beautiful breasts, perfect body, perfect anatomy), (perfect hands, perfect hand anatomy, perfect finger, beautiful finger, perfect hands, good hands:1.2), beautiful and aesthetic, (otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), 1girl, female prehistoric cavewoman wearing Animal fur bandeau top with bone accents, fur loincloth, bone hair ornament, hide sandals, teeth necklace,hide belt,shell bracelet, \\nLinens Closet, Deep in the heart of the hospital, this closet houses stacks of crisp white sheets and fluffy towels, detergent, industrial washing machine, (fantasy world), (fantasy world)", ADetailer confidence: 0.3, ADetailer dilate erode: 4, ADetailer mask blur: 4, ADetailer denoising strength: 0.4, ADetailer inpaint only masked: True, ADetailer inpaint padding: 32, ADetailer ControlNet model: Passthrough, ADetailer model 2nd: PitHandDetailer-v1-seg.pt, ADetailer prompt 2nd: "(otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), (perfect face, beautiful face, perfect lips, perfect mouth, perfect detailed leg, beautiful detailed leg, perfect accurate limb, perfect beautiful breasts, perfect body, perfect anatomy), (perfect hands, perfect hand anatomy, perfect finger, beautiful finger, perfect hands, good hands:1.2), beautiful and aesthetic, (otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), 1girl, female prehistoric cavewoman wearing Animal fur bandeau top with bone accents, fur loincloth, bone hair ornament, hide sandals, teeth necklace,hide belt,shell bracelet, \\nLinens Closet, Deep in the heart of the hospital, this closet houses stacks of crisp white sheets and fluffy towels, detergent, industrial washing machine, (fantasy world), (fantasy world)", ADetailer confidence 2nd: 0.3, ADetailer dilate erode 2nd: 4, ADetailer mask blur 2nd: 4, ADetailer denoising strength 2nd: 0.4, ADetailer inpaint only masked 2nd: True, ADetailer inpaint padding 2nd: 32, ADetailer version: 24.4.2, sv_prompt: "(otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), 1girl, __cf-*/prompt-costume__, \\n__cf-*/location/*__, (fantasy world)", sv_negative: "EasyNegative, (normal quality, low quality, worst quality:1.4), jpeg artifacts, (username, watermark, signature, time signature, timestamp, artist name, artist signature, artist logo, twitter username, patreon username, copyright name, copyright notice, copyright abbreviation, copyright signature, copyright), (loli, child, infant, baby:1.3), (bad anatomy, extra digits, extra_fingers, wrong finger, inaccurate limb, bad hand, bad fingers), (African American, African:1.6), (tits, nipple:1.6), (pubic hair:1.6)", Template: "(otherworldly), highly insanely detailed, masterpiece, top quality, best quality, highres, 4k, 8k, RAW photo, (very aesthetic, beautiful and aesthetic), 1girl, female prehistoric cavewoman wearing Animal fur bandeau top with bone accents, fur loincloth, bone hair ornament, hide sandals, teeth necklace,hide belt,shell bracelet, \\nLinens Closet, Deep in the heart of the hospital, this closet houses stacks of crisp white sheets and fluffy towels, detergent, industrial washing machine, (fantasy world)", Negative Template: "EasyNegative, (normal quality, low quality, worst quality:1.4), jpeg artifacts, (username, watermark, signature, time signature, timestamp, artist name, artist signature, artist logo, twitter username, patreon username, copyright name, copyright notice, copyright abbreviation, copyright signature, copyright), (loli, child, infant, baby:1.3), (bad anatomy, extra digits, extra_fingers, wrong finger, inaccurate limb, bad hand, bad fingers), (African American, African:1.6), (tits, nipple:1.6), (pubic hair:1.6)", Cutoff enabled: True, Cutoff targets: ["white", "black", "green", "red", "blue", "yellow", "pink", "purple", "bronze", "blonde", "silver", "magenta"], Cutoff padding: _</w>, Cutoff weight: 0.5, Cutoff disable_for_neg: True, Cutoff strong: False, Cutoff interpolation: lerp, TI hashes: "EasyNegative: c74b4e810b03", Version: f0.0.17v1.8.0rc-1.7.0`;

		let actual = splitSmartly(input, [','], {
			brackets: newDefaultSettings()
				.brackets
				.slice()
				.concat([['(', ')'], ['[', ']'], ['{', '}'], ['__', '__'], ['<', '>']] as any),
			trimSeparators: true,
		});

		expect(actual).toMatchSnapshot();

	});

})
