"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import GetStartedButton from "@/components/navigation/GetStartedButton";
import { Blockquote, H3, P } from "@/components/typography/Typography";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";

export default function About() {
  return (
    <PageContainer maxWidth="small" className="space-y-8">

      <PageHeading
        title={`About ${TITLE_COPY}`}
        subtitle={`${SUBTITLE_COPY}`}
      />

      <Blockquote className="font-bold not-italic">
        Exhibit digital art, tell your story, and document your place in art history.
      </Blockquote>


      <section className="space-y-4">
        <H3>Why {TITLE_COPY}?</H3>
        <P>
          In this digital era, art risks being lost in fragmented feeds and
          fleeting links. {TITLE_COPY} offers a new way to experience digital
          art where your creative journey is curated as a coherent, evolving
          story. Each timeline entry, whether a project or milestone, is placed
          in context, transforming scattered digital artifacts into a lasting
          exhibition.
        </P>
      </section>

      <section className="space-y-4">
        <H3>What You Can Do</H3>
        <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
          <li>
            <strong>Curate Your Personal Timeline:</strong>Craft your digital
            history as a cohesive narrative.
          </li>
          <li>
            <strong>Integrate Blockchain Assets:</strong> Showcase digital
            assets you&apos;ve created or collected with on-chain provenance.
            Currently supporting Solana, with Tezos and Ethereum on the horizon.
          </li>
          <li>
            <strong>Create Galleries:</strong> Design dedicated exhibition pages
            for collections and related works, while keeping your timeline
            refined and powerful.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <H3>The Vision</H3>
        <P>
          What began as a passion project by digital-generative artist EV3 has
          grown into a mission to help shape and uplift the digital art
          Renaissance. {TITLE_COPY} makes digital art feel real—not just for
          insiders, but for everyone. By giving artists and collectors tools to
          present their work with clarity and context, we preserve today&apos;s
          creative moment for the future.
        </P>
      </section>

      <section className="space-y-4">
        <H3>Founder&apos;s Note</H3>
        <Blockquote>
          “I believe we are living at the edge of a digital art Renaissance. But
          for this movement to truly claim its place in history, we need a way
          to present and preserve our stories. We need digital art to feel real,
          personal, and lasting. We need shared rituals that connect us, and
          stories that uplift us. My mission with {TITLE_COPY} is to bring that
          to life, celebrating the digital history we are creating together.”
          <br />- EV3
        </Blockquote>
      </section>

      <section className="space-y-4">
        <H3>Join the Movement</H3>
        <P>
          Transform scattered images, posts, and links into one cohesive story with on-chain provenance. Join the movement and document your place in art history today.
        </P>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-16">
        <GetStartedButton />
      </div>
    </PageContainer>
  );
}
