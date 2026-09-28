import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import Vision

guard CommandLine.arguments.count == 3 else {
  fputs("usage: vision-source-cutout.swift INPUT OUTPUT\n", stderr)
  exit(64)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
  let source = NSImage(contentsOf: inputURL),
  let cgImage = source.cgImage(forProposedRect: nil, context: nil, hints: nil)
else {
  fputs("could not read input image\n", stderr)
  exit(65)
}

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cgImage)
try handler.perform([request])

guard let observation = request.results?.first else {
  fputs("no foreground mask was produced\n", stderr)
  exit(66)
}

let maskBuffer = try observation.generateScaledMaskForImage(
  forInstances: observation.allInstances,
  from: handler
)
let sourceImage = CIImage(cgImage: cgImage)
// Erode the automatically detected boundary before a very small feather. This
// removes source-background colour spill while changing alpha only: RGB pixels
// inside the product remain the untouched source pixels.
let maskImage = CIImage(cvPixelBuffer: maskBuffer)
  .applyingFilter("CIMorphologyMinimum", parameters: ["inputRadius": 28.0])
  .applyingFilter("CIGaussianBlur", parameters: ["inputRadius": 0.6])
  .cropped(to: sourceImage.extent)
let clearBackground = CIImage(
  color: CIColor(red: 0, green: 0, blue: 0, alpha: 0)
).cropped(to: sourceImage.extent)

let blend = CIFilter.blendWithMask()
blend.inputImage = sourceImage
blend.backgroundImage = clearBackground
blend.maskImage = maskImage

guard let output = blend.outputImage else {
  fputs("could not composite mask\n", stderr)
  exit(67)
}

let colourSpace = CGColorSpace(name: CGColorSpace.sRGB)!
let context = CIContext(options: [.workingColorSpace: colourSpace])
try context.writePNGRepresentation(
  of: output,
  to: outputURL,
  format: .RGBA8,
  colorSpace: colourSpace
)
