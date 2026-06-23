import type { FieldSectionConfig } from "@/components/fields/types/field.types";
import { FieldControlShell } from "@/components/fields/utils/field-control-shell";
import { InputControl } from "@/components/fields/utils/input-control";
import { SelectControl } from "@/components/fields/utils/select-control";
import { TextareaControl } from "@/components/fields/utils/textarea-control";
import { ToggleGroup } from "@/components/fields/utils/toggle-control";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type FieldSectionRendererProps = {
  sections: FieldSectionConfig[];
  containerClassName?: string;
  wrapInGroup?: boolean;
};

type RenderSectionOptions = {
  showSeparatorBefore?: boolean;
};

function renderInputField(field: NonNullable<FieldSectionConfig["fields"]>[number], index: number) {
  const fieldId = field.id ?? `field-input-${index}`;

  return (
    <FieldControlShell
      containerClassName={cn("max-w-none", field.containerClassName)}
      description={field.description}
      descriptionPlacement={field.descriptionPlacement ?? "below"}
      disabled={field.disabled}
      fieldClassName={cn(field.gridClassName, field.fieldClassName)}
      id={fieldId}
      invalid={field.invalid}
      key={fieldId}
      label={field.label}
      labelClassName={field.labelClassName}
      orientation={field.orientation}
    >
      <InputControl {...field} id={fieldId} />
    </FieldControlShell>
  );
}

function renderSelectField(
  select: NonNullable<FieldSectionConfig["selects"]>[number],
  index: number,
) {
  const selectId = select.id ?? `field-select-${index}`;

  return (
    <FieldControlShell
      containerClassName={cn("max-w-none", select.containerClassName)}
      description={select.description}
      descriptionPlacement={select.descriptionPlacement ?? "below"}
      disabled={select.disabled}
      fieldClassName={cn(select.gridClassName, select.fieldClassName)}
      id={selectId}
      invalid={select.invalid}
      key={selectId}
      label={select.label}
      labelClassName={select.labelClassName}
      orientation={select.orientation}
    >
      <SelectControl {...select} id={selectId} />
    </FieldControlShell>
  );
}

function renderTextareaField(
  textarea: NonNullable<FieldSectionConfig["textareas"]>[number],
  index: number,
) {
  const textareaId = textarea.id ?? `field-textarea-${index}`;

  return (
    <FieldControlShell
      containerClassName={cn("max-w-none", textarea.containerClassName)}
      description={textarea.description}
      descriptionPlacement={textarea.descriptionPlacement ?? "below"}
      disabled={textarea.disabled}
      fieldClassName={cn(textarea.gridClassName, textarea.fieldClassName)}
      id={textareaId}
      invalid={textarea.invalid}
      key={textareaId}
      label={textarea.label}
      labelClassName={textarea.labelClassName}
      orientation={textarea.orientation}
    >
      <TextareaControl {...textarea} id={textareaId} />
    </FieldControlShell>
  );
}

function renderSection(section: FieldSectionConfig, index: number, options?: RenderSectionOptions) {
  const hasFields = Boolean(section.fields?.length);
  const hasSelects = Boolean(section.selects?.length);
  const hasTextareas = Boolean(section.textareas?.length);
  const hasToggles = Boolean(section.toggles?.length);
  const hasNested = Boolean(section.nestedGroups?.length);
  const gridClassName = section.gridClassName;

  const content = (
    <FieldSet key={`section-${index}`}>
      {section.legend ? (
        <FieldLegend variant={section.legendVariant ?? "legend"}>{section.legend}</FieldLegend>
      ) : null}
      {section.label ? <FieldLabel>{section.label}</FieldLabel> : null}
      {section.description ? <FieldDescription>{section.description}</FieldDescription> : null}

      {hasFields || hasSelects || hasTextareas ? (
        <FieldGroup className={cn(gridClassName, section.groupClassName)}>
          {section.fields?.map(renderInputField)}
          {section.selects?.map(renderSelectField)}
          {section.textareas?.map(renderTextareaField)}
        </FieldGroup>
      ) : null}

      {hasToggles ? (
        <FieldGroup
          className={section.groupClassName}
          data-slot={section.checkboxGroup ? "checkbox-group" : undefined}
        >
          <ToggleGroup kind="checkbox" options={section.toggles ?? []} />
        </FieldGroup>
      ) : null}

      {hasNested ? (
        <FieldGroup className={section.groupClassName}>
          {section.nestedGroups?.map((nested, nestedIndex) =>
            renderSection(nested, nestedIndex),
          )}
        </FieldGroup>
      ) : null}
    </FieldSet>
  );

  if (options?.showSeparatorBefore && section.separator) {
    return (
      <div key={`section-wrap-${index}`}>
        <FieldSeparator>{section.separator}</FieldSeparator>
        {content}
      </div>
    );
  }

  if (options?.showSeparatorBefore) {
    return (
      <div key={`section-wrap-${index}`}>
        <FieldSeparator />
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Renders declarative field sections with FieldSet, FieldGroup, and separators.
 */
export function FieldSectionRenderer({
  sections,
  containerClassName,
  wrapInGroup = true,
}: FieldSectionRendererProps) {
  const renderedSections = sections.map((section, index) =>
    renderSection(section, index, {
      showSeparatorBefore: index > 0 && Boolean(sections[index - 1]?.separator !== undefined || section.separator !== undefined),
    }),
  );

  if (!wrapInGroup) {
    return <div className={containerClassName}>{renderedSections}</div>;
  }

  return (
    <FieldGroup className={containerClassName}>
      {sections.map((section, index) => {
        const sectionNode = renderSection(section, index);
        const needsSeparator = index > 0 && (section.separator || sections[index - 1]?.separator);

        if (needsSeparator) {
          return (
            <div key={`section-group-${index}`}>
              <FieldSeparator>{section.separator}</FieldSeparator>
              {sectionNode}
            </div>
          );
        }

        return sectionNode;
      })}
    </FieldGroup>
  );
}

/**
 * Renders a flat list of input fields inside a FieldSet.
 */
export function FieldInputGroupRenderer({
  legend,
  legendVariant = "legend",
  description,
  fields,
  gridClassName,
  orientation,
  containerClassName,
}: {
  legend?: string;
  legendVariant?: "legend" | "label";
  description?: string;
  fields: NonNullable<FieldSectionConfig["fields"]>;
  gridClassName?: string;
  orientation?: FieldSectionConfig["orientation"];
  containerClassName?: string;
}) {
  return (
    <div className={containerClassName}>
      <FieldSet>
        {legend ? <FieldLegend variant={legendVariant}>{legend}</FieldLegend> : null}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldGroup className={gridClassName}>
          {fields.map((field, index) =>
            renderInputField({ ...field, orientation: field.orientation ?? orientation }, index),
          )}
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
