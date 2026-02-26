import React from 'react'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-12">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2">
      {title}
    </h2>
    {children}
  </div>
)

const StyleRow: React.FC<{
  label: string
  spec: string
  children: React.ReactNode
}> = ({ label, spec, children }) => (
  <div className="py-5 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <span className="text-muted-foreground/30">—</span>
      <code className="text-[11px] font-mono text-muted-foreground/50">{spec}</code>
    </div>
    <div>{children}</div>
  </div>
)

export const TypeStyles: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Type Styles
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Typography system used across the Merlin Research Agent prototype.
          </p>
        </div>

        {/* ── Font Families ── */}
        <Section title="Font Families">
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-2">font-display &middot; Cabinet Grotesk</p>
              <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-2">font-sans &middot; Geist</p>
              <p className="font-sans text-2xl text-foreground">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-2">font-serif &middot; Arbutus Slab</p>
              <p className="font-serif text-2xl text-foreground">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-2">font-mono &middot; JetBrains Mono</p>
              <p className="font-mono text-2xl text-foreground">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </Section>

        {/* ── Display / Heading Hierarchy ── */}
        <Section title="Heading Hierarchy">
          <StyleRow label="Display" spec="36px / 700 · text-4xl / font-display / font-bold / tracking-tight">
            <p className="text-4xl font-display font-bold tracking-tight text-foreground">Display heading</p>
          </StyleRow>
          <StyleRow label="H1" spec="30px / 700 · text-3xl / font-display / font-bold / tracking-tight">
            <p className="text-3xl font-display font-bold tracking-tight text-foreground">Page title heading</p>
          </StyleRow>
          <StyleRow label="H2" spec="24px / 700 · text-2xl / font-bold / tracking-tight">
            <p className="text-2xl font-bold tracking-tight text-foreground">Section title heading</p>
          </StyleRow>
          <StyleRow label="H3" spec="20px / 600 · text-xl / font-semibold / tracking-tight">
            <p className="text-xl font-semibold tracking-tight text-foreground">Subsection heading</p>
          </StyleRow>
          <StyleRow label="H4" spec="18px / 600 · text-lg / font-semibold / leading-tight">
            <p className="text-lg font-semibold leading-tight text-foreground">Card title heading</p>
          </StyleRow>
        </Section>

        {/* ── Body Text ── */}
        <Section title="Body Text">
          <StyleRow label="Body Large" spec="16px / 400 · text-base / font-normal / font-sans">
            <p className="text-base font-normal text-foreground">
              This is standard body text used for main content areas, descriptions, and longer form reading. It should be comfortable to read at any viewport width.
            </p>
          </StyleRow>
          <StyleRow label="Body" spec="14px / 400 · text-sm / font-normal / font-sans">
            <p className="text-sm font-normal text-foreground">
              This is the most commonly used body size for UI text, sidebar items, descriptions, and general interface copy throughout the application.
            </p>
          </StyleRow>
          <StyleRow label="Body Small" spec="12px / 400 · text-xs / font-normal / font-sans">
            <p className="text-xs font-normal text-foreground">
              Small body text for secondary information, timestamps, metadata, and supporting details.
            </p>
          </StyleRow>
        </Section>

        {/* ── UI Labels ── */}
        <Section title="UI Labels & Controls">
          <StyleRow label="Button" spec="14px / 500 · text-sm / font-medium">
            <p className="text-sm font-medium text-foreground">Button label text</p>
          </StyleRow>
          <StyleRow label="Label" spec="14px / 500 · text-sm / font-medium / leading-none">
            <p className="text-sm font-medium leading-none text-foreground">Form label text</p>
          </StyleRow>
          <StyleRow label="Badge" spec="12px / 600 · text-xs / font-semibold">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">Badge text</span>
          </StyleRow>
          <StyleRow label="Overline" spec="12px / 600 · text-xs / font-semibold / uppercase / tracking-wider">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overline label text</p>
          </StyleRow>
          <StyleRow label="Caption" spec="12px / 500 · text-xs / font-medium / tracking-wider">
            <p className="text-xs font-medium tracking-wider text-muted-foreground">Caption or chart label</p>
          </StyleRow>
        </Section>

        {/* ── Semantic Colors ── */}
        <Section title="Text Colors">
          <StyleRow label="Primary" spec="text-foreground">
            <p className="text-sm text-foreground">Primary text — headings, body, key content</p>
          </StyleRow>
          <StyleRow label="Secondary" spec="text-muted-foreground">
            <p className="text-sm text-muted-foreground">Secondary text — descriptions, hints, metadata</p>
          </StyleRow>
          <StyleRow label="Muted" spec="text-muted-foreground/60">
            <p className="text-sm text-muted-foreground/60">Muted text — placeholders, disabled states</p>
          </StyleRow>
          <StyleRow label="Link / Accent" spec="text-primary">
            <p className="text-sm text-primary font-medium">Link or accent text</p>
          </StyleRow>
          <StyleRow label="Destructive" spec="text-destructive">
            <p className="text-sm text-destructive font-medium">Error or destructive text</p>
          </StyleRow>
        </Section>

        {/* ── Font Weights ── */}
        <Section title="Font Weights">
          <StyleRow label="Normal (400)" spec="font-normal">
            <p className="text-lg font-normal text-foreground">Regular weight for body text</p>
          </StyleRow>
          <StyleRow label="Medium (500)" spec="font-medium">
            <p className="text-lg font-medium text-foreground">Medium weight for labels and buttons</p>
          </StyleRow>
          <StyleRow label="Semibold (600)" spec="font-semibold">
            <p className="text-lg font-semibold text-foreground">Semibold weight for emphasis and headings</p>
          </StyleRow>
          <StyleRow label="Bold (700)" spec="font-bold">
            <p className="text-lg font-bold text-foreground">Bold weight for display and page titles</p>
          </StyleRow>
        </Section>

        {/* ── Tracking (Letter Spacing) ── */}
        <Section title="Letter Spacing">
          <StyleRow label="Tight" spec="tracking-tight">
            <p className="text-xl font-semibold tracking-tight text-foreground">Tracking tight — used for headings</p>
          </StyleRow>
          <StyleRow label="Normal" spec="tracking-normal">
            <p className="text-xl font-semibold tracking-normal text-foreground">Tracking normal — default spacing</p>
          </StyleRow>
          <StyleRow label="Wide" spec="tracking-wide">
            <p className="text-sm tracking-wide text-foreground">Tracking wide — occasionally used</p>
          </StyleRow>
          <StyleRow label="Wider" spec="tracking-wider">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TRACKING WIDER — OVERLINES AND BADGES</p>
          </StyleRow>
          <StyleRow label="Widest" spec="tracking-widest">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">TRACKING WIDEST — SECTION LABELS</p>
          </StyleRow>
        </Section>

        {/* ── Component Examples ── */}
        <Section title="Component Typography Examples">
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-3">Dialog Title</p>
              <p className="text-lg font-semibold leading-none tracking-tight text-foreground">Dialog title style</p>
              <p className="text-sm text-muted-foreground mt-1.5">Dialog description text sits below the title</p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-3">Finding Card</p>
              <p className="text-lg font-bold leading-tight text-foreground">Finding title with bold weight</p>
              <p className="text-sm text-muted-foreground mt-1">Supporting body copy for the finding insight text below the title.</p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-3">Sidebar Item</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-sidebar-foreground">Sidebar navigation item</span>
                <span className="text-xs text-muted-foreground ml-auto">3</span>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-3">Table</p>
              <div className="flex items-center gap-8 text-sm">
                <span className="font-medium text-muted-foreground">Column header</span>
                <span className="text-foreground">Cell value text</span>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-3">Monospace / Code</p>
              <code className="text-sm font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">const agent = new MerlinAgent()</code>
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}
