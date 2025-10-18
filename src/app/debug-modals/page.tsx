// src/app/debug-modals/page.tsx
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

export default function DebugModalsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modal Debug Page
          </h1>
          <p className="text-gray-600">
            Debug modal display issues on mobile devices
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Viewport Info</h2>
          <div className="space-y-2 text-sm">
            <p>Screen Width: <span id="screen-width">{typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</span>px</p>
            <p>Screen Height: <span id="screen-height">{typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</span>px</p>
            <p>Viewport Width: <span id="viewport-width">{typeof window !== 'undefined' ? window.visualViewport?.width || window.innerWidth : 'N/A'}</span>px</p>
            <p>Viewport Height: <span id="viewport-height">{typeof window !== 'undefined' ? window.visualViewport?.height || window.innerHeight : 'N/A'}</span>px</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                Test Modal
              </Button>
            </DialogTrigger>
            <DialogContent size="md">
              <DialogHeader>
                <DialogTitle>Modal Debug Test</DialogTitle>
                <DialogDescription>
                  This modal should display correctly on mobile devices with proper margins and height constraints.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Modal Dimensions</h3>
                  <p className="text-sm">This content should be scrollable if it exceeds the modal height.</p>
                  <p className="text-sm">The modal should have safe margins on mobile devices.</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-sm">Content Block 1</span>
                  </div>
                  <div className="h-20 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-sm">Content Block 2</span>
                  </div>
                  <div className="h-20 bg-yellow-100 rounded flex items-center justify-center">
                    <span className="text-sm">Content Block 3</span>
                  </div>
                  <div className="h-20 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-sm">Content Block 4</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">CSS Classes Applied</h2>
          <div className="text-sm font-mono bg-gray-100 p-4 rounded">
            <div>Mobile: fixed inset-x-4 top-[50%] max-h-[85vh] translate-y-[-50%]</div>
            <div>Small: max-h-[90vh]</div>
            <div>Tablet+: sm:left-[50%] sm:top-[50%] sm:w-full sm:translate-x-[-50%] sm:translate-y-[-50%] sm:p-6 sm:rounded-lg</div>
            <div>Size: sm:max-w-md</div>
          </div>
        </div>
      </div>
    </div>
  );
}
