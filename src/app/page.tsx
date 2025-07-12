'use client';
import PageWrapper from '@/components/PageWrapper';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import {
  ElegooWSClient,
  PrinterAttributes,
  PrinterStatus,
} from '@/utils/elegoo-ws-client';

interface Printer {
  id: string;
  displayName?: string;
  ip: string;
  mainboardId?: string;
  wsClient?: ElegooWSClient;
  printerStatus?: PrinterStatus;
  attributes?: PrinterAttributes;
  lastMessageTime?: Date | string;
}

export default function Home() {
  const { welcomeDismissed, dismissWelcome } = useSiteSettings();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrinter, setNewPrinter] = useState({ name: '', ip: '' });
  const [timeKey, setTimeKey] = useState(0); // Force re-render for real-time updates
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load printers from localStorage on mount
  useEffect(() => {
    const savedPrinters = localStorage.getItem('ccTool-printers');
    console.log('Loading printers from localStorage:', savedPrinters);
    if (savedPrinters) {
      try {
        const parsedPrinters = JSON.parse(savedPrinters);
        console.log('Parsed printers:', parsedPrinters);
        setPrinters(parsedPrinters);
      } catch (error) {
        console.error('Failed to load printers from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Reconnect to printers after they're loaded
  useEffect(() => {
    if (printers.length > 0 && isInitialized) {
      console.log('Reconnecting to printers:', printers);
      printers.forEach((printer: Printer) => {
        if (printer.ip && !printer.wsClient) {
          console.log('Connecting to printer:', printer.ip);
          connectToPrinter(printer);
        }
      });
    }
  }, [printers.length, isInitialized, printers]); // Only run when printers array length changes

  // Save printers to localStorage whenever printers change
  useEffect(() => {
    // Don't save until after initial load
    if (!isInitialized) return;

    const printersToSave = printers.map(printer => ({
      ...printer,
      wsClient: undefined, // Don't save WebSocket client
    }));
    console.log('Saving printers to localStorage:', printersToSave);
    localStorage.setItem('ccTool-printers', JSON.stringify(printersToSave));
  }, [printers, isInitialized]);

  // Timer to update the display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside (with delay to avoid interfering with button clicks)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the dropdown button or dropdown content
      const target = event.target as Element;
      if (target.closest('.dropdown-container')) {
        return;
      }
      setOpenDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const addPrinter = () => {
    setShowAddModal(true);
  };

  const handleAddPrinter = () => {
    if (!newPrinter.name.trim() || !newPrinter.ip.trim()) return;

    const printer: Printer = {
      id: Date.now().toString(),
      displayName: newPrinter.name.trim(),
      ip: newPrinter.ip.trim(),
    };

    setPrinters(prev => [...prev, printer]);
    connectToPrinter(printer);
    setNewPrinter({ name: '', ip: '' });
    setShowAddModal(false);
  };

  const cancelAddPrinter = () => {
    setNewPrinter({ name: '', ip: '' });
    setShowAddModal(false);
  };

  const connectToPrinter = (printer: Printer) => {
    // Don't reconnect if already connected
    if (printer.wsClient) {
      return;
    }

    const wsClient = new ElegooWSClient(`ws://${printer.ip}/websocket`);

    wsClient.onMessage(msg => {
      setPrinters(prev =>
        prev.map(p => {
          //check if the messsage is about current printer
          if (p.id === printer.id) {
            const baseUpdate = {
              ...p,
              mainboardId: msg.MainboardID || p.mainboardId,
              wsClient,
              lastMessageTime: new Date(),
            };

            if (msg.Attributes) {
              //we have device info and need to update the printer with complete attributes
              return {
                ...baseUpdate,
                attributes: msg.Attributes,
              };
            }

            // Check if this is a status update message (direct data)
            if (msg.Status && typeof msg.Status === 'object') {
              const statusData = msg.Status as Record<string, unknown>;
              // Check if it looks like a status message by checking for key properties
              if (
                statusData.TempOfHotbed !== undefined ||
                statusData.PrintInfo !== undefined
              ) {
                return {
                  ...baseUpdate,
                  printerStatus: statusData as unknown as PrinterStatus,
                };
              }
            }

            return baseUpdate;
          }
          return p;
        })
      );
    });

    wsClient.connect();

    // Update printer with client
    setPrinters(prev =>
      prev.map(p => (p.id === printer.id ? { ...p, wsClient } : p))
    );
  };

  const refreshPrinters = () => {
    setPrinters(prev =>
      prev.map(printer => ({
        ...printer,
        status: 'connecting' as const,
      }))
    );

    printers.forEach(printer => {
      if (printer.wsClient) {
        printer.wsClient.close();
        connectToPrinter(printer);
      }
    });
  };

  const disconnectPrinter = (printerId: string) => {
    setPrinters(prev => {
      const printer = prev.find(p => p.id === printerId);
      if (printer?.wsClient) {
        printer.wsClient.close();
      }
      return prev.filter(p => p.id !== printerId);
    });
  };

  const formatLastMessageTime = (date?: Date | string) => {
    if (!date) return null;

    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return null;

    // Use timeKey to force re-calculation every second
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="overflow-x-hidden min-h-screen">
      <PageWrapper>
        {/* Notification Card */}
        {!welcomeDismissed && (
          <div className="mb-8">
            <div className="bg-[var(--color-purple-50)] dark:bg-[var(--color-purple-950)] border border-[var(--color-purple-200)] dark:border-[var(--color-purple-800)] rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-[var(--color-purple-900)] dark:text-[var(--color-purple-100)]">
                      Welcome to ccTool
                    </h3>
                    <p className="mt-2  text-[var(--color-purple-900)] dark:text-[var(--color-purple-100)]">
                      To get started add the IP address to your Centuri Carbon
                      printer
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissWelcome}
                  className="text-[var(--color-purple-500)] hover:text-[var(--color-purple-700)] dark:text-[var(--color-purple-400)] dark:hover:text-[var(--color-purple-200)] transition-colors"
                  aria-label="Dismiss welcome message"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 mb-8">
          <button
            type="button"
            onClick={addPrinter}
            className="bg-[var(--color-purple-500)] hover:bg-[var(--color-purple-600)] text-white dark:bg-[var(--color-purple-400)] dark:hover:bg-[var(--color-purple-300)] dark:text-gray-900 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            Add Printer
          </button>
          <button
            type="button"
            onClick={refreshPrinters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-8" />

        {/* Printer List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          {printers.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Connected Printers
              </h2>
              <div className="space-y-4">
                {printers.map(printer => (
                  <div
                    key={printer.id}
                    className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {printer.displayName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {printer.ip}
                      </p>
                      {printer.attributes?.BrandName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {printer.attributes.BrandName} -{' '}
                          {printer.attributes.MachineName}
                        </p>
                      )}
                      {printer.attributes?.FirmwareVersion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Firmware: {printer.attributes.FirmwareVersion}
                        </p>
                      )}
                      {printer.lastMessageTime && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Updated:
                          {formatLastMessageTime(printer.lastMessageTime)}
                          {/* timeKey triggers re-render every second */}
                          <span className="hidden">{timeKey}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative dropdown-container">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            console.log(
                              'Button clicked, current:',
                              openDropdown,
                              'printer:',
                              printer.id
                            );
                            setOpenDropdown(
                              openDropdown == printer.id ? null : printer.id
                            );
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded"
                          aria-label="Printer options"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {openDropdown === printer.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 dropdown-container max-w-xs">
                            <div className="py-1">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  disconnectPrinter(printer.id);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                NO PRINTERS FOUND
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add a printer to get started with ccTool
              </p>
            </div>
          )}
        </div>
      </PageWrapper>

      {/* Add Printer Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={cancelAddPrinter}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Printer
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="printer-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="printer-name"
                  value={newPrinter.name}
                  onChange={e =>
                    setNewPrinter(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-500)] dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., My Centauri Carbon"
                />
              </div>
              <div>
                <label
                  htmlFor="printer-ip"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  IP Address
                </label>
                <input
                  type="text"
                  id="printer-ip"
                  value={newPrinter.ip}
                  onChange={e =>
                    setNewPrinter(prev => ({ ...prev, ip: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-500)] dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelAddPrinter}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrinter}
                disabled={!newPrinter.name.trim() || !newPrinter.ip.trim()}
                className="bg-[var(--color-purple-500)] hover:bg-[var(--color-purple-600)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white dark:bg-[var(--color-purple-400)] dark:hover:bg-[var(--color-purple-300)] dark:text-gray-900 px-4 py-2 rounded-md transition-colors"
              >
                Add Printer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
