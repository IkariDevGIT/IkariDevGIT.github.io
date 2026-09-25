---
title: Noromaid model series
description: The Noromaid model series (with Undi) and its Mixtral/Miqu spin-offs.
pubDate: 2023-12-19T22:51:00+02:00
tags: [ai, llm, neversleep]
---

[NeverSleep Discord](https://discord.gg/w6C8mys35E)

Name comes from:<br>
Noro = <span style="color: red;">No</span>\_<span style="color: red;">ro</span>bots(dataset),<br>
Maid = <span style="color: red;">M</span>inerva <span style="color: red;">AI</span> <span style="color: red;">D</span>ataset

MinervaAI Dataset referring to: Aesir

---

### Noromaid 0.1.1

- [Noromaid-13b-v0.1.1](https://huggingface.co/NeverSleep/Noromaid-13b-v0.1.1)
- [Noromaid-7b-v0.1.1](https://huggingface.co/NeverSleep/Noromaid-7b-v0.1.1)
- [Noromaid-20b-v0.1.1](https://huggingface.co/NeverSleep/Noromaid-20b-v0.1.1)

Yet another merge with undi, came out 16.11.2023, main part of it a dataset by [MinervaAI](https://huggingface.co/MinervaAI) named aesir, other part is a [modified version of No_Robots](https://huggingface.co/datasets/Doctor-Shotgun/no-robots-sharegpt).

### Noromaid 0.2 [ EXPERIMENTAL ]

- [Noromaid-13b-v0.2](https://huggingface.co/NeverSleep/Noromaid-13b-v0.2)
- [Noromaid-7b-v0.2](https://huggingface.co/NeverSleep/Noromaid-7b-v0.2)

As seen in the title, this model is pretty experimental!

This time we used [MergeMonster](https://github.com/Gryphe/MergeMonster), with many bad_phrases. We also used another [MinervaAI](https://huggingface.co/MinervaAI) dataset.

The 13b was published on 16.12.2023, the 7b was released on 21.12.2023, further B's will be released when we get more feedback.

### Noromaid 0.3

- [Noromaid-13b-v0.3](https://huggingface.co/NeverSleep/Noromaid-13b-v0.3)

Noromaid 0.3 has: new datasets, normal alpaca Instruct(with instruction, input, and response header) instead of our modified alpaca.

It is a complete retrain based on the same model as 0.1.1 and 0.1.

### Noromaid 0.4

- [Noromaid-7b-v0.4](https://huggingface.co/NeverSleepHistorical/Noromaid-7B-0.4)
- [Noromaid-7b-v0.4-DPO](https://huggingface.co/NeverSleep/Noromaid-7B-0.4-DPO)

Noromaid 7b v0.4 is a fully finetuned 7b Mistral trained on multiple RP dataset, modified by our own hand, and redone entirely from Alpaca to Chatml. The switch from Alpaca to Chatml and the addition of a new dataset from Aesir made it even better than 0.3.

Noromaid 7b v0.4 DPO is the same as Noromaid 0.4 7b. Additionally, it was trained on top with 3 DPO datasets including the Intel DPO for reasoning, and some uncensoring.

---

## Spin-Off's

_(standalone)_

### Mixtral

- [Noromaid-v0.1-mixtral-8x7b-v1](https://huggingface.co/NeverSleepHistorical/Noromaid-v0.1-mixtral-8x7b-v1) ~ a fine-tune of Mixtral 8x7b, trained on various RP datasets including LimaRP and Aesir, ToxicDPO without warning for decensoring and norobots, rewritten to use a modified Alpaca prompting to be on a par with ChatML or other conversational formats. This version contains 3x Alpaca modified datasets (for the RP one) and 2 shareGPT datasets. LimaRP token length, input, and output size got wiped out, and were separated into chunks of +8k context conversation (this is the maximum LimaRP can offer).
- [Noromaid-v0.1-mixtral-8x7b-v2](https://huggingface.co/NeverSleepHistorical/Noromaid-v0.1-mixtral-8x7b-v2) ~ same base recipe as v1. On this v2, LimaRP got fixed further, Axolotl received a monkey patch to actually reformat shareGPT to our modified Alpaca prompting.
- [Noromaid-v0.1-mixtral-8x7b-v3](https://huggingface.co/NeverSleep/Noromaid-v0.1-mixtral-8x7b-v3) ~ contains 5x Alpaca modified datasets. On this v3, all the datasets got trained on the "completion" method of Axolotl, with all the datasets being completely rewritten to be in Alpaca modified format. More than 2600 Wikipedia references got cleaned up of Norobots dataset.
- [Noromaid-v0.1-mixtral-8x7b-Instruct-v3](https://huggingface.co/NeverSleep/Noromaid-v0.1-mixtral-8x7b-Instruct-v3) ~ made with a LoRA done on base Mixtral 8x7b. It's the same data than Noromaid-v0.1-mixtral-8x7b-v3, but applied on the Instruct model. Fine-tuning on base and applying on Instruct seem to give better result for our usage: RP/ERP. Stay tuned for more information!

Noromaid-v0.1-mixtral-8x7b series info: v1 and v2 were each trained for 2 epochs, totaling to each 8 hours on Axolotl. v3, on the other hand, underwent 3 epochs and was trained for 12 hours, bringing the cumulative training time to 28 hours on a single A100 80GB GPU.

### Miqu ~ [HF Collection](https://huggingface.co/collections/NeverSleep/miqumaid-65c3d5e0fd15420346adc906)

- [MiquMaid-v1-70B](https://huggingface.co/NeverSleep/MiquMaid-v1-70B) ~ Quick train to see if [miqu](https://huggingface.co/152334H/miqu-1-70b-sf) finetuned results in good models.
- [MiquMaid-v2-70B-alpha-GGUF](https://huggingface.co/NeverSleepHistorical/MiquMaid-v2-70B-alpha-GGUF) (GGUF only) ~ trained on 1 epoch for 18h running on 2xA100 80GB. Trained on [miqu](https://huggingface.co/152334H/miqu-1-70b-sf). <span style="color: red;">Deprecated!</span>
- [MiquMaid-v2-70B](https://huggingface.co/NeverSleep/MiquMaid-v2-70B) / [DPO](https://huggingface.co/NeverSleep/MiquMaid-v2-70B-DPO) ~ MiquMaid-v1-70B was our first 70B model, based on the leaked Mistral Medium model. V1 used Aesir datasets where V2 make the return of Norobots and some uncensoring data in it to make it even more unethical in RP.<br>V1 was already compliant to a lot of things, even on some prompt Mistral Medium would refuse 100%, because it is HIGHLY aligned. This V2 let you prompt even more unethical and unhinged RP. Not using any RP format show a rate of refusal really lower than Mistral Medium too!<br>On top of that, a DPO train, using the same data that was used in the OG Finetune for better performance made it even better, write better, and be even more uncensored. The model lose some points in benchmark, but the tradeback for really good RP and less repetition was worth it.
- [MiquMaid-v2-2x70B](https://huggingface.co/NeverSleep/MiquMaid-v2-2x70B) / [DPO](https://huggingface.co/NeverSleep/MiquMaid-v2-2x70B-DPO) ~ really heavy, it's a 125B model made of MiquMaid-v2-70B and Mistral Medium base. Each MoE model have 2 expert active in them, so the idea between this was to have, on every token, 2x70B expert working together for more randomness and better precision. Since MiquMaid-v2 is here only for RP, it lose some IQ point, that's where Mistral Medium hit and make the prose a lot more better, and let the model be more logical. It's better than a frakenmerge of 2 Mistral medium because it's not 1:1 2x the same model.<br>The gem tho, is the DPO version. When the qLora for uncensoring was made on MiquMaid-v2 for uncensoring it, we got the idea to apply it to Mistral Medium base too. At first, the result wasn't really good and that was expected, since the qLora wasn't trained on Mistral Medium, but on MiquMaid-v2. BUT! When merged together (in a MoE for this example) the full potential of a double DPO shine.<br>We got astonish result on the worst quant ever: Q2_K. Even at Q2_K, MiquMaid-v2-2x70B-DPO showed godly performance in RP, following card, logic and smut. Only downside was the repetition of the formatting, but it was really usable. Unquanted is a gem, but we doubt anyone have the compute power to do that...

_(based on 0.4)_

- [Noromaid-v0.4-Mixtral-Instruct-8x7b-Zloss](https://huggingface.co/NeverSleep/Noromaid-v0.4-Mixtral-Instruct-8x7b-Zloss) ~ It's Noromaid-v0.1-mixtral-8x7b-Instruct-v3 but retrained with ChatML, Zloss(Thanks charles), and some added datasets.
- [FlatOrcamaid-13b-v0.2](https://huggingface.co/NeverSleep/FlatOrcamaid-13b-v0.2) ~ a merge between FlatOrca and Noromaid-13b-v0.2, see more info on the repo.
  - <span style="color: rgb(255, 245, 110);">Important info to a 7b model:</span> Currently not possible due to Orca-2 being a LLAMA 2 7b model and Noromaid-7b being a mistral model!
  - <span style="color: rgb(255, 245, 110);">Important info to this model:</span> This model is in NO way affiliated with [ddh0/OrcaMaid-13b](https://huggingface.co/ddh0/OrcaMaid-13b) or and \*maid models by [ddh0](https://huggingface.co/ddh0/OrcaMaid-13b), it was inspired by him tho.

---

**Credits:**

- Undi / Wrote parts of the blog post.

## Updates

- **20.12.2023, 11:55:** Okay so, because some people asked about if the datasets will be released.. Yes they probably will, but not from me neither Undi. The maid part aka. Aesir will only be released after the official Aesir model from [MinervaAI](https://huggingface.co/MinervaAI) is released.
- **21.12.2023, 19:56:** Added FlatOrcamaid-13b-v0.2 [ Released on: 20.12.2023 ]. Added Noromaid-7b-v0.2 [ Released on: 21.12.2023 ].
- **23.12.2023, 15:03:** Added Noromaid-v0.1-mixtral-8x7b [ Released on: 22.12.2023 ].
- **24.12.2023, 13:14:** Added FlatOrcamaid-13b-v0.2 disclaimer. Added Noromaid-v0.1-mixtral-8x7b-v2 [ Released on: 23.12.2023 ]. Added Noromaid-v0.1-mixtral-8x7b-v3 [ Released on: 24.12.2023 ].
- **26.12.2023, 00:18:** Added Noromaid-v0.1-mixtral-8x7b-Instruct-v3 [ Released on: 25.12.2023 ].
- **09.01.2024, 20:13:** Added NeverSleep Discord link. Added Noromaid 0.3 [ Released on: 05.01.2024 ].
- **12.01.2024, 19:13:** Added Noromaid 0.4 [ Released on: 11.01.2024 ]. Added Noromaid 0.4 DPO [ Released on: 11.01.2024 ]. Added credits. Added Noromaid-v0.4-Mixtral-Instruct-8x7b-Zloss [ Released on: 09.01.2024 ].
- **12.01.2024, 23:45:** Did some re-formatting. Fixed some skill issue mistakes on my side.
- **05.02.2024, 20:14:** Added MiquMaid-v1-70B [ Released on: 31.01.2024 ]. Added MiquMaid-v2-70B-alpha-GGUF [ Released on: 04.02.2024 ].
- **07.02.2024, 20:20:** Added MiquMaid HF Collection. Added MiquMaid-v2-70B [ Released on: 07.02.2024 ]. Added MiquMaid-v2-70B-DPO [ Released on: 07.02.2024 ]. Added MiquMaid-v2-2x70B [ Released on: 07.02.2024 ]. Added MiquMaid-v2-2x70B-DPO [ Released on: 07.02.2024 ].
