import { useState, type ReactNode } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

const typeClasses = {
  string: "text-green-600 dark:text-green-400",
  number: "text-blue-600 dark:text-blue-400",
  boolean: "text-purple-600 dark:text-purple-400",
  null: "text-zinc-400 dark:text-zinc-500",
  key: "text-rose-500 dark:text-rose-400",
};

const INDENT = 16;
// px-0.5 (2px) + w-3 icon (12px) + ml-0.5 (2px) − ml-0.5 button shift (−2px) = 14px
const CHEVRON_WIDTH = 14;

type PathSegment = string | number;

function formatPath(path: PathSegment[]): string {
  return path
    .map((seg) =>
      typeof seg === "number"
        ? `[${seg}]`
        : /^[a-zA-Z_$][\w$]*$/.test(seg)
          ? `.${seg}`
          : `[${JSON.stringify(seg)}]`,
    )
    .join("");
}

interface JsonTreeProps {
  data: unknown;
  depth?: number;
  defaultExpanded?: boolean;
  keyName?: PathSegment;
  path?: PathSegment[];
}

function KeyPrefix({ keyName, path, data }: { keyName?: PathSegment; path: PathSegment[]; data?: unknown }) {
  if (keyName === undefined) return null;

  const pathStr = formatPath(path);

  const keyEl = typeof keyName === "number" ? (
    <span className="text-muted-foreground select-none mr-1">{keyName}:</span>
  ) : (
    <span className={`${typeClasses.key} select-none mr-1 shrink-0`}>"{keyName}":</span>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <span className="cursor-context-menu" title={pathStr}>{keyEl}</span>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(pathStr)}>
          <span className="shrink-0">Copy path</span>
          <span className="text-muted-foreground truncate ml-auto pl-4 max-w-64">{pathStr}</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}>
          Copy JSON
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function JsonTree({ data, depth = 0, defaultExpanded, keyName, path: parentPath = [] }: JsonTreeProps) {
  const expanded = defaultExpanded ?? depth < 1;
  const path = keyName !== undefined ? [...parentPath, keyName] : parentPath;

  if (data === null) {
    return (
      <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
        <KeyPrefix keyName={keyName} path={path} data={data} />
        <span className={typeClasses.null}>null</span>
      </span>
    );
  }
  if (data === undefined) {
    return (
      <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
        <KeyPrefix keyName={keyName} path={path} data={data} />
        <span className={typeClasses.null}>undefined</span>
      </span>
    );
  }

  switch (typeof data) {
    case "string":
      return <StringValue value={data} keyName={keyName} path={path} />;
    case "number":
      return <NumberValue value={data} keyName={keyName} path={path} />;
    case "boolean":
      return (
        <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
          <KeyPrefix keyName={keyName} path={path} data={data} />
          <span className={typeClasses.boolean}>{String(data)}</span>
        </span>
      );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
          <KeyPrefix keyName={keyName} path={path} data={data} />
          <span className="text-muted-foreground">{"[]"}</span>
        </span>
      );
    }
    return (
      <CollapsibleNode
        keyName={keyName}
        path={path}
        data={data}
        label={`Array(${data.length})`}
        bracket={["[", "]"]}
        defaultExpanded={expanded}
      >
        {data.map((item, i) => (
          <div key={i} style={{ paddingLeft: INDENT }}>
            <JsonTree data={item} depth={depth + 1} keyName={i} path={path} />
          </div>
        ))}
      </CollapsibleNode>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
          <KeyPrefix keyName={keyName} path={path} data={data} />
          <span className="text-muted-foreground">{"{}"}</span>
        </span>
      );
    }
    return (
      <CollapsibleNode
        keyName={keyName}
        path={path}
        data={data}
        label={`{${entries.length}}`}
        bracket={["{", "}"]}
        defaultExpanded={expanded}
      >
        {entries.map(([key, val]) => (
          <div key={key} style={{ paddingLeft: INDENT }}>
            <JsonTree data={val} depth={depth + 1} keyName={key} path={path} />
          </div>
        ))}
      </CollapsibleNode>
    );
  }

  return (
    <span className="min-w-0" style={{ paddingLeft: CHEVRON_WIDTH }}>
      <KeyPrefix keyName={keyName} path={path} data={data} />
      {String(data)}
    </span>
  );
}

function isPlausibleTimestamp(n: number): boolean {
  // seconds: 1970-01-01 ~ 2100-01-01
  if (n >= 0 && n <= 4102444800) return true;
  // milliseconds: 1970-01-01 ~ 2100-01-01
  if (n >= 0 && n <= 4102444800000) return true;
  return false;
}

function NumberValue({ value, keyName, path }: { value: number; keyName?: PathSegment; path: PathSegment[] }) {
  const [showDate, setShowDate] = useState(false);
  const canDecode = isPlausibleTimestamp(value);
  // heuristic: >1e12 is ms, otherwise seconds
  const ms = value > 1e12 ? value : value * 1000;
  const dateStr = canDecode ? new Date(ms).toISOString() : "";

  return (
    <span className="inline-flex items-center gap-1 min-w-0 max-w-full group/num" style={{ paddingLeft: CHEVRON_WIDTH }}>
      <KeyPrefix keyName={keyName} path={path} data={value} />
      <span
        className={`${typeClasses.number}${canDecode ? " cursor-pointer hover:underline" : ""}`}
        onClick={canDecode ? () => setShowDate(!showDate) : undefined}
      >
        {String(value)}
      </span>
      {showDate && (
        <span className="text-muted-foreground text-xs">= {dateStr}</span>
      )}
      {canDecode && (
        <span className="invisible group-hover/num:visible inline-flex items-center gap-1 shrink-0">
          <CopyButton text={dateStr} label="copy date" />
        </span>
      )}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={label}
      className="inline-flex items-center rounded-sm px-1 py-0.5 text-[10px] bg-accent hover:bg-accent/80 text-accent-foreground cursor-pointer shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="w-3 h-3 mr-0.5" /> : <Copy className="w-3 h-3 mr-0.5" />}
      {copied ? "copied" : label}
    </button>
  );
}

function StringValue({ value, keyName, path }: { value: string; keyName?: PathSegment; path: PathSegment[] }) {
  const [decoded, setDecoded] = useState(false);
  const raw = JSON.stringify(value);

  const toolbar = (
    <span className="invisible group-hover/str:visible inline-flex items-center gap-1 shrink-0">
      <CopyButton text={raw} label="copy" />
      <CopyButton text={value} label="copy decoded" />
    </span>
  );

  if (decoded) {
    return (
      <span className="min-w-0 w-full inline-flex flex-col group/str" style={{ paddingLeft: CHEVRON_WIDTH }}>
        <span className="inline-flex items-center gap-1">
          <KeyPrefix keyName={keyName} path={path} data={value} />
          <span
            className={`${typeClasses.string} truncate min-w-0 cursor-pointer hover:underline`}
            onClick={() => setDecoded(false)}
          >"{value}"</span>
          {toolbar}
        </span>
        <pre className="mt-0.5 ml-2 px-2 py-1.5 rounded-sm bg-muted text-foreground text-xs whitespace-pre-wrap break-all border border-border/50 max-h-64 overflow-auto">
          {value}
        </pre>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 min-w-0 max-w-full group/str" style={{ paddingLeft: CHEVRON_WIDTH }}>
      <KeyPrefix keyName={keyName} path={path} data={value} />
      <span
        className={`${typeClasses.string} truncate min-w-0 cursor-pointer hover:underline`}
        onClick={() => setDecoded(true)}
      >"{value}"</span>
      {toolbar}
    </span>
  );
}

function CollapsibleNode({
  keyName,
  path,
  data,
  label,
  bracket,
  defaultExpanded,
  children,
}: {
  keyName?: PathSegment;
  path: PathSegment[];
  data: unknown;
  label: string;
  bracket: [string, string];
  defaultExpanded: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultExpanded);

  const toggle = () => setOpen(!open);

  return (
    <span className="min-w-0">
      <span className="inline-flex items-center">
        <span
          className="inline-flex items-center hover:bg-accent rounded-sm px-0.5 -ml-0.5 cursor-pointer"
          onClick={toggle}
        >
          {open ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </span>
        <span className="ml-0.5 inline-flex items-center">
          <span className="cursor-pointer" onClick={toggle}>
            <KeyPrefix keyName={keyName} path={path} data={data} />
          </span>
          <span className="text-muted-foreground text-xs cursor-pointer" onClick={toggle}>
            {open ? bracket[0] : `${bracket[0]} ${label} ${bracket[1]}`}
          </span>
        </span>
      </span>
      {open && (
        <div>
          {children}
          <span className="text-muted-foreground" style={{ paddingLeft: CHEVRON_WIDTH }}>{bracket[1]}</span>
        </div>
      )}
    </span>
  );
}
