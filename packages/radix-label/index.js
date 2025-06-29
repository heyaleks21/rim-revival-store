"use client"

const React = require("react")

/**
 * Very small drop-in replacement for Radix Label.
 * Behaves like a normal HTML <label> while keeping the API expected by shadcn/ui.
 */
const Label = React.forwardRef(function Label({ className = "", ...props }, ref) {
  return React.createElement("label", { ref, className, ...props })
})

Label.displayName = "Label"

module.exports = {
  Label,
  Root: Label, // Radix exports `Root`; shadcn/ui uses `Label`
  default: Label,
}
