"use client";
import { useState } from "react";
import { BarChart3, Image as ImageIcon, Plus, Sparkles, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Grid } from "@/components/layout/grid";
import { Stack } from "@/components/layout/stack";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { PageHeader } from "@/components/patterns/page-header";

const colorTokens = [
  { name: "--color-background", value: "#050507" },
  { name: "--color-surface-muted", value: "#060811" },
  { name: "--color-surface", value: "#0a0d12" },
  { name: "--color-surface-elevated", value: "#151a24" },
  { name: "--color-foreground", value: "#ededed" },
  { name: "--color-foreground-muted", value: "#a1a1a1" },
  { name: "--color-foreground-subtle", value: "#7a7a7a" },
  { name: "--color-primary", value: "#082ea2" },
  { name: "--color-primary-hover", value: "#4169e1" },
  { name: "--color-accent", value: "#422bc1" },
  { name: "--color-accent-hover", value: "#7c5cf0" },
  { name: "--color-success", value: "#6ed7b2" },
  { name: "--color-warning", value: "#f4c06a" },
  { name: "--color-danger", value: "#ff7f87" },
];

export default function DesignSystemPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  return (
    <PageShell containerSize="wide" className="py-16">
      <PageHeader eyebrow="Internal reference" title="Design system" description="Real components and tokens from src/components/ui and src/app/tokens.css — not a duplicated demo." />

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Colors</h2>
        <Grid cols="four" gap="sm">
          {colorTokens.map((token) => (
            <Card key={token.name} className="p-3">
              <div className="h-16 rounded-[var(--radius-sm)] border border-[var(--color-border)]" style={{ background: token.value }} />
              <div className="cue-code mt-2 text-xs">{token.name}</div>
              <div className="cue-caption normal-case tracking-normal text-[var(--color-foreground-subtle)]">{token.value}</div>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Typography</h2>
        <Stack gap="md">
          <p className="cue-display">Display</p>
          <p className="cue-h1">Heading 1 — page title</p>
          <p className="cue-heading">Heading 2 — section title</p>
          <p className="cue-h3">Heading 3 — card title</p>
          <p className="cue-body-lg">Body large — important introductory copy.</p>
          <p className="cue-body">Body — default readable content, used for most paragraphs.</p>
          <p className="cue-body-sm">Body small — secondary, less prominent content.</p>
          <p className="cue-label">Label — buttons, form labels, navigation</p>
          <p className="cue-caption">Caption — metadata, timestamps</p>
          <p className="cue-code">const code = &quot;monospace&quot;;</p>
        </Stack>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Spacing &amp; layout</h2>
        <Stack gap="sm">
          {[1, 2, 4, 6, 8, 12].map((step) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-[var(--color-foreground-subtle)]">p-{step}</span>
              <div className="bg-[var(--color-primary-hover)]" style={{ width: step * 4, height: 12 }} />
            </div>
          ))}
        </Stack>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Buttons</h2>
        <Stack gap="md">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button variant="inverse">Inverse (marketing)</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <IconButton aria-label="Add"><Plus className="size-4" /></IconButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
              {loading ? "Loading…" : "Click to trigger loading"}
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Stack>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Form controls</h2>
        <Grid cols="two" gap="lg">
          <Stack gap="md">
            <FormField label="Email" hint="We'll never share it."><Input placeholder="you@example.com" /></FormField>
            <FormField label="Email" error="Enter a valid email address."><Input aria-invalid="true" placeholder="you@example.com" /></FormField>
            <FormField label="Message"><Textarea placeholder="Type here…" /></FormField>
            <FormField label="Theme">
              <Select defaultValue="signal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="signal">Signal</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </Stack>
          <Stack gap="md">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked />Checkbox</label>
            <label className="flex items-center gap-2 text-sm"><Switch defaultChecked />Switch</label>
            <RadioGroup defaultValue="a" className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="a" />Option A</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="b" />Option B</label>
            </RadioGroup>
          </Stack>
        </Grid>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Cards, badges, stats</h2>
        <Grid cols="three" gap="md">
          <Card>
            <CardHeader><CardTitle>Card title</CardTitle><CardDescription>A short supporting description.</CardDescription></CardHeader>
            <CardContent><Badge>Default</Badge> <Badge variant="primary">Primary</Badge> <Badge variant="success">Success</Badge></CardContent>
            <CardFooter><Button size="sm" variant="secondary">Action</Button></CardFooter>
          </Card>
          <StatCard icon={Users} value={128} label="Attendees joined" />
          <StatCard icon={BarChart3} value="4" label="Live moments" tone="accent" />
        </Grid>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Alerts</h2>
        <Stack gap="sm">
          <Alert variant="info"><AlertTitle>Heads up</AlertTitle><AlertDescription>Informational message.</AlertDescription></Alert>
          <Alert variant="success"><AlertTitle>Saved</AlertTitle><AlertDescription>Changes were saved successfully.</AlertDescription></Alert>
          <Alert variant="warning"><AlertTitle>Careful</AlertTitle><AlertDescription>This action needs attention.</AlertDescription></Alert>
          <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Something went wrong.</AlertDescription></Alert>
        </Stack>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Tabs, tooltip, dropdown-adjacent, avatar, separator</h2>
        <Stack gap="lg">
          <Tabs defaultValue="one">
            <TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList>
            <TabsContent value="one" className="cue-body-sm">First tab content.</TabsContent>
            <TabsContent value="two" className="cue-body-sm">Second tab content.</TabsContent>
          </Tabs>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="secondary" size="sm">Hover me</Button></TooltipTrigger>
                <TooltipContent>A helpful tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Avatar><AvatarFallback>CP</AvatarFallback></Avatar>
            <Sparkles className="size-4 text-[var(--color-primary-hover)]" />
          </div>
          <Separator />
        </Stack>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Dialog &amp; sheet</h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Dialog title</DialogTitle><DialogDescription>Radix-backed — focus trap and Escape-to-close included.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="primary">Confirm</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild><Button variant="secondary">Open sheet</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Sheet title</SheetTitle></SheetHeader>
              <p className="cue-body-sm">Side-anchored panel, same primitive as Dialog.</p>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Loading &amp; empty states</h2>
        <Grid cols="three" gap="md">
          <Card className="p-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></Card>
          <Card className="flex items-center justify-center p-4"><Spinner className="size-6" /></Card>
          <EmptyState icon={ImageIcon} title="No decks yet" description="Create your first live deck." action={<Button size="sm"><Plus className="size-4" />Create deck</Button>} />
        </Grid>
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Pagination</h2>
        <Pagination page={page} pageCount={5} onPageChange={setPage} />
      </Section>

      <Section spacing="md" as="div">
        <h2 className="cue-h3 mb-4">Responsive</h2>
        <p className="cue-body-sm">Resize the window — <code className="cue-code">Container</code> steps its gutter at 16px (mobile) / 24px (tablet, 640px+) / 32px (desktop, 1024px+), and <code className="cue-code">Grid</code> collapses to one column below the sm breakpoint.</p>
      </Section>
    </PageShell>
  );
}
