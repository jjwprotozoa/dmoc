// src/app/test-mobile-modals/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function TestMobileModalsPage() {
  const [openSmall, setOpenSmall] = useState(false);
  const [openMedium, setOpenMedium] = useState(false);
  const [openLarge, setOpenLarge] = useState(false);
  const [openXLarge, setOpenXLarge] = useState(false);
  const [openFull, setOpenFull] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mobile Modal Responsiveness Test
          </h1>
          <p className="text-gray-600">
            Test modals across different screen sizes to ensure proper mobile responsiveness
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Small Modal */}
          <Dialog open={openSmall} onOpenChange={setOpenSmall}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <span className="font-semibold">Small Modal</span>
                <span className="text-xs text-gray-500">max-w-sm</span>
              </Button>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Small Modal Test</DialogTitle>
                <DialogDescription>
                  This is a small modal that should fit well on mobile devices.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenSmall(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpenSmall(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Medium Modal */}
          <Dialog open={openMedium} onOpenChange={setOpenMedium}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <span className="font-semibold">Medium Modal</span>
                <span className="text-xs text-gray-500">max-w-md</span>
              </Button>
            </DialogTrigger>
            <DialogContent size="md">
              <DialogHeader>
                <DialogTitle>Medium Modal Test</DialogTitle>
                <DialogDescription>
                  This is a medium modal with more content to test scrolling behavior.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="First name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter your address" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenMedium(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpenMedium(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Large Modal */}
          <Dialog open={openLarge} onOpenChange={setOpenLarge}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <span className="font-semibold">Large Modal</span>
                <span className="text-xs text-gray-500">max-w-lg</span>
              </Button>
            </DialogTrigger>
            <DialogContent size="lg">
              <DialogHeader>
                <DialogTitle>Large Modal Test</DialogTitle>
                <DialogDescription>
                  This is a large modal with extensive content to test mobile scrolling and layout.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Company name" />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Job position" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Job description..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input id="salary" placeholder="Salary range" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Work location" />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input id="type" placeholder="Full-time/Part-time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <textarea
                    id="requirements"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Job requirements..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenLarge(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpenLarge(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* XLarge Modal */}
          <Dialog open={openXLarge} onOpenChange={setOpenXLarge}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <span className="font-semibold">XLarge Modal</span>
                <span className="text-xs text-gray-500">max-w-xl</span>
              </Button>
            </DialogTrigger>
            <DialogContent size="xl">
              <DialogHeader>
                <DialogTitle>XLarge Modal Test</DialogTitle>
                <DialogDescription>
                  This is an extra large modal to test the limits of mobile responsiveness.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="field1">Field 1</Label>
                    <Input id="field1" placeholder="Field 1" />
                  </div>
                  <div>
                    <Label htmlFor="field2">Field 2</Label>
                    <Input id="field2" placeholder="Field 2" />
                  </div>
                  <div>
                    <Label htmlFor="field3">Field 3</Label>
                    <Input id="field3" placeholder="Field 3" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="longText">Long Text Field</Label>
                  <textarea
                    id="longText"
                    className="w-full p-2 border rounded-md"
                    rows={5}
                    placeholder="This is a long text field to test scrolling behavior on mobile devices..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenXLarge(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpenXLarge(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Full Width Modal */}
          <Dialog open={openFull} onOpenChange={setOpenFull}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <span className="font-semibold">Full Width</span>
                <span className="text-xs text-gray-500">max-w-full</span>
              </Button>
            </DialogTrigger>
            <DialogContent size="full">
              <DialogHeader>
                <DialogTitle>Full Width Modal Test</DialogTitle>
                <DialogDescription>
                  This modal uses full width to test edge cases on mobile devices.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="col1">Column 1</Label>
                    <Input id="col1" placeholder="Column 1" />
                  </div>
                  <div>
                    <Label htmlFor="col2">Column 2</Label>
                    <Input id="col2" placeholder="Column 2" />
                  </div>
                  <div>
                    <Label htmlFor="col3">Column 3</Label>
                    <Input id="col3" placeholder="Column 3" />
                  </div>
                  <div>
                    <Label htmlFor="col4">Column 4</Label>
                    <Input id="col4" placeholder="Column 4" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fullWidthText">Full Width Text</Label>
                  <textarea
                    id="fullWidthText"
                    className="w-full p-2 border rounded-md"
                    rows={6}
                    placeholder="This text area spans the full width of the modal to test how it behaves on different screen sizes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenFull(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpenFull(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Test each modal on different screen sizes (mobile, tablet, desktop)</p>
            <p>• Verify modals don&apos;t exceed viewport height on mobile devices</p>
            <p>• Check that content scrolls properly when it exceeds modal height</p>
            <p>• Ensure modals are properly centered and have appropriate margins</p>
            <p>• Test on actual mobile devices for touch interaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
