"use client";

import { useShowReturnButton } from "@/atoms/navigation";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import GetStartedButton from "@/components/navigation/GetStartedButton";
import { Blockquote, H3, P } from "@/components/typography/Typography";
import { TITLE_COPY } from "@/textCopy/mainCopy";

export default function About() {
  useShowReturnButton();
  return (
    <PageContainer maxWidth="small" className="space-y-8">
      <PageHeading title={`About us`} />

      <Blockquote>
        <P className="not-italic font-bold">
          {TITLE_COPY} is bringing digital art galleries to life.
        </P>
        <ul className="pl-0 leading-relaxed">
          <li>Made for artists to create thoughtful portfolio sites.</li>
          <li>
            Made for art admirers to curate and exhibit their collections.
          </li>
          <li>Made to celebrate your digital history.</li>
        </ul>
      </Blockquote>

      <section className="space-y-4">
        <H3>Why {TITLE_COPY}?</H3>
        <P>
          In this digital era, art risks being lost in fragmented feeds and
          fleeting links. {TITLE_COPY} offers a new way to experience digital
          art, displaying everything together in a decluttered and customizable
          space.
        </P>
      </section>

      <section className="space-y-4">
        <H3>What You Can Do</H3>
        <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
          <li>
            <strong>Create Galleries:</strong> curated collections where people
            can explore your art in depth.
          </li>
          <li>
            <strong>Curate your personal Timeline:</strong> the entryway into
            your creative world. Introduce yourself, highlight favorite
            artworks, and connect your galleries.
          </li>
          <li>
            <strong>Import blockchain assets:</strong> easily view and share
            digital art works with on-chain provenance.
            <span className="text-muted-foreground text-sm">
              {" "}
              *Currently supporting Solana, with Tezos and Ethereum coming soon.
            </span>
          </li>
          <li>
            <strong>Upload your own media:</strong> IRL gallery photos, process
            videos, and anything else you might want to share.
            <span className="text-muted-foreground text-sm">
              {" "}
              *Coming soon.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <H3>The Vision</H3>
        <P>
          What began as a passion project by generative-glitch artist EV3 has
          grown into a mission to help uplift a burgeoning art movement. {TITLE_COPY} is here to make digital art feel real, not just for
          insiders, but for everyone. By giving artists and collectors tools to
          present their artworks with clarity and context, we will help
          today&apos;s creative movement thrive and preserve it for the future.
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
          Easily gather scattered images, posts, and links into one curated
          space. Create galleries to exhibit collections. Showcase your favorite
          pieces and craft your story in a timeline that brings it all together.
          Join {TITLE_COPY} to start celebrating your digital history today!
        </P>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-16">
        <GetStartedButton />
      </div>
    </PageContainer>
  );
}
