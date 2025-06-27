"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-left">How do I know which rims will fit my vehicle?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">
            Rim fitment depends on several factors including bolt pattern (PCD), offset, center bore, and wheel size.
          </p>
          <p>
            The easiest way to ensure proper fitment is to provide us with your vehicle's make, model, year, and current
            wheel specifications. We can then recommend compatible options from our inventory or source specific rims
            for your needs.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger className="text-left">Do you offer wheel and tyre packages?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer complete wheel and tyre packages. This includes mounting and balancing the tyres on your chosen
          rims. Package deals often provide better value than purchasing rims and tyres separately. Contact us for
          current package pricing and available options.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger className="text-left">What's the difference between alloy and steel rims?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">
            <strong>Alloy Rims:</strong> Typically made from aluminum alloys, these are lighter, provide better
            performance, and offer more aesthetic options. They dissipate heat better but can be more susceptible to
            damage from potholes and curbs.
          </p>
          <p>
            <strong>Steel Rims:</strong> More durable and less expensive than alloy wheels. They're heavier, which can
            affect fuel economy and performance, but they're more resistant to damage and easier to repair.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger className="text-left">Can you repair damaged rims?</AccordionTrigger>
        <AccordionContent>
          Yes, our sister store at{" "}
          <a
            href="https://www.rimrevivals.com.au"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.rimrevivals.com.au
          </a>{" "}
          specializes in rim repairs and restoration. They can fix issues like:
          <ul className="list-disc pl-6 mt-2">
            <li>Curb rash and scratches</li>
            <li>Bent or cracked rims (depending on severity)</li>
            <li>Cosmetic damage</li>
            <li>Corrosion and peeling finish</li>
          </ul>
          Visit their website or contact us for more information about their repair services.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger className="text-left">How often should I replace my tyres?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">
            Tyres should be replaced when the tread depth reaches 1.6mm (legal minimum in Australia). However, we
            recommend replacement when tread depth reaches 3mm for optimal safety, especially in wet conditions.
          </p>
          <p className="mb-2">Other signs that indicate you need new tyres include:</p>
          <ul className="list-disc pl-6">
            <li>Visible damage like cuts, cracks, or bulges</li>
            <li>Uneven wear patterns</li>
            <li>Vibration while driving</li>
            <li>Tyres that are more than 5 years old (regardless of tread)</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-6">
        <AccordionTrigger className="text-left">Do you offer aftermarket and OEM rims?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer both Original Equipment Manufacturer (OEM) rims and aftermarket options. OEM rims are identical
          to those that came with your vehicle from the factory, while aftermarket rims offer more variety in design,
          size, and finish. Our inventory includes both new and quality used options to suit different budgets and
          preferences.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-7">
        <AccordionTrigger className="text-left">What's included in your rim restoration service?</AccordionTrigger>
        <AccordionContent>
          Our sister store at{" "}
          <a
            href="https://www.rimrevivals.com.au"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.rimrevivals.com.au
          </a>{" "}
          offers comprehensive rim restoration services including:
          <ul className="list-disc pl-6 mt-2">
            <li>Complete strip and refinish</li>
            <li>Repair of curb damage and scratches</li>
            <li>Custom color options and finishes</li>
            <li>Powder coating for durability</li>
            <li>Wheel straightening (where possible)</li>
            <li>Polishing for chrome and machined finishes</li>
          </ul>
          Each wheel is thoroughly inspected and restored to look as close to new as possible.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-8">
        <AccordionTrigger className="text-left">Do you offer a warranty on your products?</AccordionTrigger>
        <AccordionContent>
          Yes, all our rims and tyres come with warranties:
          <ul className="list-disc pl-6 mt-2">
            <li>New tyres: Manufacturer's warranty (typically 5-6 years)</li>
            <li>Used tyres: 30-day limited warranty against manufacturing defects</li>
            <li>New rims: 1-year warranty against manufacturing defects</li>
            <li>Used rims: 30-day warranty against structural issues</li>
            <li>Restored rims: 6-month warranty on the finish</li>
          </ul>
          Warranty details are provided with your purchase and may vary by product.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-9">
        <AccordionTrigger className="text-left">Can I trade in my old rims and tyres?</AccordionTrigger>
        <AccordionContent>
          Yes, we do accept trade-ins of used rims and tyres in good condition. The trade-in value depends on the
          condition, brand, size, and current market demand. Bring your items to our store for an assessment and quote,
          or send us clear photos via email for a preliminary estimate.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-10">
        <AccordionTrigger className="text-left">Do you offer installation services?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer professional installation services including:
          <ul className="list-disc pl-6 mt-2">
            <li>Mounting and balancing</li>
            <li>Tyre rotation</li>
            <li>Wheel alignment checks</li>
            <li>TPMS service and programming</li>
            <li>Proper torquing to manufacturer specifications</li>
          </ul>
          We recommend professional installation to ensure safety and optimal performance. Installation fees vary based
          on the service required.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
