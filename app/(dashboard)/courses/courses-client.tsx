"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"
import {
    Search,
    Grid3X3,
    List,
    ChevronDown,
    ChevronRight,
    Play,
    MoreHorizontal,
    Clock,
    BookOpen,
    CheckCircle,
    Heart,
    Folder,
    FolderPlus,
    Plus,
    Filter,
    Users,
    GraduationCap,
    Trash2,
    ShoppingBag,
    Sparkles,
    BookMarked,
    Layers,
    FileText,
    X,
    Check,
    Copy,
    Edit3,
    Share2,
    BarChart3,
    Zap,
    HelpCircle,
    Image,
    Timer,
    Award
} from "lucide-react"
import { isCreator } from "@/lib/teacher"

interface CoursesClientProps {
    user: any
    allCourses: any[]
    onSignOut: () => void
}

interface FolderType {
    id: string
    name: string
    color: string
    courseIds: string[] // Course IDs assigned to this folder
    kahootIds: string[] // Kahoot IDs assigned to this folder
}

type QuestionType = "quiz" | "truefalse" | "poll" | "puzzle" | "typing"

interface KahootQuestion {
    id: string
    type: QuestionType
    question: string
    answers: string[]
    correctAnswer: number | number[] // number for single, array for multiple correct
    timeLimit: number // seconds: 5, 10, 20, 30, 60, 90, 120, 240
    points: number // 0, 1000, 2000
    image?: string
    videoUrl?: string
    explanation?: string
}

interface KahootType {
    id: string
    title: string
    description: string
    coverImage?: string
    color: string
    questions: KahootQuestion[]
    visibility: "private" | "public" | "organization"
    plays: number
    favorites: number
    players: number // total unique players
    createdAt: string
    updatedAt: string
    status: "draft" | "published"
    category?: string
    language?: string
    difficulty?: "easy" | "medium" | "hard"
}

// Demo Knows Data
const DEMO_KAHOOTS: KahootType[] = [
    {
        id: "demo-math-1",
        title: "Matemáticas Básicas - Suma y Resta",
        description: "Quiz interactivo para practicar operaciones matemáticas básicas. Ideal para estudiantes de primaria.",
        color: "#e21b3c",
        questions: [
            { id: "q1", type: "quiz", question: "¿Cuánto es 5 + 3?", answers: ["6", "7", "8", "9"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q2", type: "quiz", question: "¿Cuánto es 12 - 4?", answers: ["6", "8", "9", "7"], correctAnswer: 1, timeLimit: 20, points: 1000 },
            { id: "q3", type: "quiz", question: "¿Cuánto es 7 + 6?", answers: ["12", "14", "13", "11"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q4", type: "truefalse", question: "15 - 9 = 6", answers: ["Verdadero", "Falso"], correctAnswer: 0, timeLimit: 10, points: 1000 },
            { id: "q5", type: "quiz", question: "¿Cuánto es 20 - 8?", answers: ["11", "13", "12", "14"], correctAnswer: 2, timeLimit: 20, points: 1000 },
        ],
        visibility: "public",
        plays: 1247,
        favorites: 89,
        players: 3420,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-02-20T15:30:00Z",
        status: "published",
        category: "Matemáticas",
        language: "es",
        difficulty: "easy"
    },
    {
        id: "demo-science-1",
        title: "El Sistema Solar",
        description: "Explora los planetas y descubre los secretos del sistema solar. ¿Cuánto sabes sobre el espacio?",
        color: "#1368ce",
        questions: [
            { id: "q1", type: "quiz", question: "¿Cuál es el planeta más grande del sistema solar?", answers: ["Marte", "Júpiter", "Saturno", "Neptuno"], correctAnswer: 1, timeLimit: 30, points: 1000 },
            { id: "q2", type: "quiz", question: "¿Cuántos planetas hay en el sistema solar?", answers: ["7", "8", "9", "10"], correctAnswer: 1, timeLimit: 20, points: 1000 },
            { id: "q3", type: "truefalse", question: "El Sol es una estrella", answers: ["Verdadero", "Falso"], correctAnswer: 0, timeLimit: 10, points: 1000 },
            { id: "q4", type: "quiz", question: "¿Qué planeta es conocido como el 'planeta rojo'?", answers: ["Venus", "Marte", "Mercurio", "Júpiter"], correctAnswer: 1, timeLimit: 20, points: 1000 },
            { id: "q5", type: "quiz", question: "¿Cuál es el planeta más cercano al Sol?", answers: ["Venus", "Tierra", "Mercurio", "Marte"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q6", type: "truefalse", question: "La Luna es un planeta", answers: ["Verdadero", "Falso"], correctAnswer: 1, timeLimit: 10, points: 1000 },
        ],
        visibility: "public",
        plays: 2891,
        favorites: 234,
        players: 8750,
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-03-01T12:00:00Z",
        status: "published",
        category: "Ciencias",
        language: "es",
        difficulty: "medium"
    },
    {
        id: "demo-history-1",
        title: "Historia de México",
        description: "Pon a prueba tus conocimientos sobre la historia de México, desde la época prehispánica hasta la actualidad.",
        color: "#26890c",
        questions: [
            { id: "q1", type: "quiz", question: "¿En qué año inició la Independencia de México?", answers: ["1810", "1821", "1910", "1800"], correctAnswer: 0, timeLimit: 30, points: 1000 },
            { id: "q2", type: "quiz", question: "¿Quién fue el primer presidente de México?", answers: ["Benito Juárez", "Guadalupe Victoria", "Porfirio Díaz", "Antonio López de Santa Anna"], correctAnswer: 1, timeLimit: 30, points: 1000 },
            { id: "q3", type: "quiz", question: "¿Qué civilización construyó Teotihuacán?", answers: ["Aztecas", "Mayas", "Olmecas", "Se desconoce"], correctAnswer: 3, timeLimit: 30, points: 1000 },
            { id: "q4", type: "truefalse", question: "La Revolución Mexicana comenzó en 1910", answers: ["Verdadero", "Falso"], correctAnswer: 0, timeLimit: 15, points: 1000 },
            { id: "q5", type: "quiz", question: "¿Quién dijo 'El respeto al derecho ajeno es la paz'?", answers: ["Miguel Hidalgo", "José María Morelos", "Benito Juárez", "Emiliano Zapata"], correctAnswer: 2, timeLimit: 30, points: 1000 },
        ],
        visibility: "public",
        plays: 1567,
        favorites: 156,
        players: 4230,
        createdAt: "2024-02-01T14:00:00Z",
        updatedAt: "2024-02-28T09:00:00Z",
        status: "published",
        category: "Historia",
        language: "es",
        difficulty: "medium"
    },
    {
        id: "demo-english-1",
        title: "English Vocabulary - Basics",
        description: "Learn and practice basic English vocabulary. Perfect for beginners!",
        color: "#d89e00",
        questions: [
            { id: "q1", type: "quiz", question: "What is 'Perro' in English?", answers: ["Cat", "Dog", "Bird", "Fish"], correctAnswer: 1, timeLimit: 20, points: 1000 },
            { id: "q2", type: "quiz", question: "What is 'Casa' in English?", answers: ["Car", "House", "Tree", "Book"], correctAnswer: 1, timeLimit: 20, points: 1000 },
            { id: "q3", type: "quiz", question: "What color is the sky?", answers: ["Red", "Green", "Blue", "Yellow"], correctAnswer: 2, timeLimit: 15, points: 1000 },
            { id: "q4", type: "truefalse", question: "'Apple' means 'Manzana' in Spanish", answers: ["True", "False"], correctAnswer: 0, timeLimit: 10, points: 1000 },
            { id: "q5", type: "quiz", question: "How do you say 'Buenos días'?", answers: ["Good night", "Good afternoon", "Good morning", "Goodbye"], correctAnswer: 2, timeLimit: 20, points: 1000 },
        ],
        visibility: "public",
        plays: 3421,
        favorites: 312,
        players: 9870,
        createdAt: "2024-01-20T11:00:00Z",
        updatedAt: "2024-03-05T16:00:00Z",
        status: "published",
        category: "Idiomas",
        language: "es",
        difficulty: "easy"
    },
    {
        id: "demo-geography-1",
        title: "Capitales del Mundo",
        description: "¿Conoces las capitales de los países? Demuestra tu conocimiento geográfico en este quiz.",
        color: "#46178f",
        questions: [
            { id: "q1", type: "quiz", question: "¿Cuál es la capital de Francia?", answers: ["Londres", "Madrid", "París", "Roma"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q2", type: "quiz", question: "¿Cuál es la capital de Japón?", answers: ["Beijing", "Seúl", "Bangkok", "Tokio"], correctAnswer: 3, timeLimit: 20, points: 1000 },
            { id: "q3", type: "quiz", question: "¿Cuál es la capital de Brasil?", answers: ["São Paulo", "Río de Janeiro", "Brasilia", "Buenos Aires"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q4", type: "quiz", question: "¿Cuál es la capital de Australia?", answers: ["Sídney", "Melbourne", "Canberra", "Perth"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q5", type: "truefalse", question: "La capital de Canadá es Toronto", answers: ["Verdadero", "Falso"], correctAnswer: 1, timeLimit: 15, points: 1000, explanation: "La capital de Canadá es Ottawa" },
            { id: "q6", type: "quiz", question: "¿Cuál es la capital de Egipto?", answers: ["Alejandría", "El Cairo", "Luxor", "Giza"], correctAnswer: 1, timeLimit: 20, points: 1000 },
        ],
        visibility: "public",
        plays: 2134,
        favorites: 198,
        players: 5670,
        createdAt: "2024-02-10T09:00:00Z",
        updatedAt: "2024-03-10T14:00:00Z",
        status: "published",
        category: "Geografía",
        language: "es",
        difficulty: "medium"
    },
    {
        id: "demo-programming-1",
        title: "Introducción a la Programación",
        description: "Conceptos básicos de programación para principiantes. Variables, bucles y más.",
        color: "#00cec8",
        questions: [
            { id: "q1", type: "quiz", question: "¿Qué es una variable en programación?", answers: ["Un tipo de computadora", "Un espacio para almacenar datos", "Un lenguaje de programación", "Un tipo de error"], correctAnswer: 1, timeLimit: 30, points: 1000 },
            { id: "q2", type: "quiz", question: "¿Qué hace un bucle 'for'?", answers: ["Detiene el programa", "Repite código un número específico de veces", "Crea una variable", "Imprime texto"], correctAnswer: 1, timeLimit: 30, points: 1000 },
            { id: "q3", type: "truefalse", question: "Python es un lenguaje de programación", answers: ["Verdadero", "Falso"], correctAnswer: 0, timeLimit: 10, points: 1000 },
            { id: "q4", type: "quiz", question: "¿Qué símbolo se usa para comentarios en Python?", answers: ["//", "/*", "#", "--"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q5", type: "quiz", question: "¿Qué tipo de dato es 'Hola Mundo'?", answers: ["Integer", "Boolean", "String", "Float"], correctAnswer: 2, timeLimit: 20, points: 1000 },
        ],
        visibility: "public",
        plays: 987,
        favorites: 87,
        players: 2340,
        createdAt: "2024-02-15T10:00:00Z",
        updatedAt: "2024-03-08T11:00:00Z",
        status: "published",
        category: "Tecnología",
        language: "es",
        difficulty: "easy"
    },
    {
        id: "demo-draft-1",
        title: "Quiz de Biología (En desarrollo)",
        description: "Quiz sobre células, organismos y ecosistemas.",
        color: "#e21b3c",
        questions: [
            { id: "q1", type: "quiz", question: "¿Cuál es la unidad básica de la vida?", answers: ["Átomo", "Molécula", "Célula", "Órgano"], correctAnswer: 2, timeLimit: 20, points: 1000 },
            { id: "q2", type: "truefalse", question: "Las plantas realizan fotosíntesis", answers: ["Verdadero", "Falso"], correctAnswer: 0, timeLimit: 10, points: 1000 },
        ],
        visibility: "private",
        plays: 0,
        favorites: 0,
        players: 0,
        createdAt: "2024-03-10T08:00:00Z",
        updatedAt: "2024-03-10T08:00:00Z",
        status: "draft",
        category: "Ciencias",
        language: "es",
        difficulty: "medium"
    }
]

type KahootTabType = "all" | "drafts" | "published" | "favorites"

type ViewMode = "grid" | "list"
type SectionType = "kahoots" | "stories" | "courses" | "purchased" | "folder" | "trash"
type TabType = "all" | "enrolled" | "completed" | "favorites" | "recent"
type SortType = "newest" | "oldest" | "alphabetical" | "progress"

export function CoursesClient({ user, allCourses, onSignOut }: CoursesClientProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Read URL params
    const sectionFromUrl = searchParams.get("section") as SectionType | null
    const tabFromUrl = searchParams.get("tab") as TabType | null
    const folderFromUrl = searchParams.get("folder")
    const validSections: SectionType[] = ["kahoots", "stories", "courses", "purchased", "folder", "trash"]
    const validTabs: TabType[] = ["all", "enrolled", "completed", "favorites", "recent"]

    // Derive active section and tab from URL
    const activeSection: SectionType = sectionFromUrl && validSections.includes(sectionFromUrl) ? sectionFromUrl : "courses"
    const activeTab: TabType = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "all"

    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortType>("newest")
    const [showSortMenu, setShowSortMenu] = useState(false)
    const [expandedFolders, setExpandedFolders] = useState(true)

    // Folder management state
    const [folders, setFolders] = useState<FolderType[]>([])
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")
    const [newFolderColor, setNewFolderColor] = useState("#46178f")
    // Selected folder from URL or state
    const selectedFolderId = folderFromUrl || null

    // Helper function to update URL params
    const updateUrlParams = (section: SectionType, tab?: string, folderId?: string | null) => {
        const params = new URLSearchParams()
        if (section !== "courses") {
            params.set("section", section)
        }
        if (tab && tab !== "all") {
            params.set("tab", tab)
        }
        if (folderId) {
            params.set("folder", folderId)
        }
        const queryString = params.toString()
        router.push(queryString ? `/courses?${queryString}` : "/courses", { scroll: false })
    }

    // Wrapper functions to update via URL
    const setActiveSection = (section: SectionType) => {
        updateUrlParams(section)
    }

    const setActiveTab = (tab: TabType) => {
        updateUrlParams(activeSection, tab, selectedFolderId)
    }

    const setSelectedFolderId = (folderId: string | null) => {
        if (folderId) {
            updateUrlParams("folder", undefined, folderId)
        } else {
            updateUrlParams("courses")
        }
    }

    // Drag and drop state
    const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null)
    const [draggedKahootId, setDraggedKahootId] = useState<string | null>(null)
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)

    // Kahoot management state
    const [kahoots, setKahoots] = useState<KahootType[]>(DEMO_KAHOOTS)
    // Kahoot tab from URL
    const kahootTabFromUrl = searchParams.get("kahootTab") as KahootTabType | null
    const validKahootTabs: KahootTabType[] = ["all", "drafts", "published", "favorites"]
    const kahootTab: KahootTabType = kahootTabFromUrl && validKahootTabs.includes(kahootTabFromUrl) ? kahootTabFromUrl : "all"

    const setKahootTab = (tab: KahootTabType) => {
        const params = new URLSearchParams()
        params.set("section", "kahoots")
        if (tab !== "all") {
            params.set("kahootTab", tab)
        }
        router.push(`/courses?${params.toString()}`, { scroll: false })
    }

    const [showCreateKahootModal, setShowCreateKahootModal] = useState(false)
    const [editingKahoot, setEditingKahoot] = useState<KahootType | null>(null)
    const [newKahoot, setNewKahoot] = useState({
        title: "",
        description: "",
        color: "#46178f",
        visibility: "private" as "private" | "public" | "organization"
    })
    const [kahootMenuOpen, setKahootMenuOpen] = useState<string | null>(null)
    const [favoriteKahoots, setFavoriteKahoots] = useState<Set<string>>(new Set())

    // Kahoot colors for cards
    const colors = ["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f", "#00cec8"]
    const getColor = (index: number) => colors[index % colors.length]

    // Track if component has mounted (to avoid hydration issues)
    const [hasMounted, setHasMounted] = useState(false)

    // Load all data from localStorage after mount (to avoid hydration mismatch)
    useEffect(() => {
        // Load folders (with backward compatibility for kahootIds)
        const savedFolders = localStorage.getItem("youknow_folders")
        if (savedFolders) {
            try {
                const parsed = JSON.parse(savedFolders)
                if (Array.isArray(parsed)) {
                    // Ensure all folders have kahootIds array (backward compatibility)
                    const foldersWithKahoots = parsed.map((folder: any) => ({
                        ...folder,
                        kahootIds: folder.kahootIds || []
                    }))
                    setFolders(foldersWithKahoots)
                }
            } catch (e) {
                console.error("Error loading folders:", e)
            }
        }

        // Load kahoots
        const savedKahoots = localStorage.getItem("youknow_kahoots")
        if (savedKahoots) {
            try {
                const parsed = JSON.parse(savedKahoots)
                if (Array.isArray(parsed)) {
                    const demoIds = DEMO_KAHOOTS.map(k => k.id)
                    const userKahoots = parsed.filter((k: KahootType) => !demoIds.includes(k.id))
                    setKahoots([...DEMO_KAHOOTS, ...userKahoots])
                }
            } catch (e) {
                console.error("Error loading kahoots:", e)
            }
        }

        // Load favorites
        const savedFavorites = localStorage.getItem("youknow_kahoot_favorites")
        if (savedFavorites) {
            try {
                const parsed = JSON.parse(savedFavorites)
                if (Array.isArray(parsed)) {
                    setFavoriteKahoots(new Set(parsed))
                }
            } catch (e) {
                console.error("Error loading favorites:", e)
            }
        }

        // Mark as mounted AFTER loading data
        setHasMounted(true)

        // Clean up orphaned course IDs (courses that no longer exist)
        // This runs once after initial load
    }, [])

    // Auto-cleanup orphaned course/kahoot IDs once after mount
    useEffect(() => {
        if (hasMounted) {
            const validCourseIds = new Set(allCourses.map(c => c.id))
            const validKahootIds = new Set(kahoots.map(k => k.id))
            setFolders(prevFolders => {
                const hasOrphans = prevFolders.some(folder =>
                    folder.courseIds.some(id => !validCourseIds.has(id)) ||
                    (folder.kahootIds || []).some(id => !validKahootIds.has(id))
                )
                if (hasOrphans) {
                    return prevFolders.map(folder => ({
                        ...folder,
                        courseIds: folder.courseIds.filter(id => validCourseIds.has(id)),
                        kahootIds: (folder.kahootIds || []).filter(id => validKahootIds.has(id))
                    }))
                }
                return prevFolders
            })
        }
    }, [hasMounted, allCourses, kahoots])

    // Save folders to localStorage when they change (only after mount)
    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("youknow_folders", JSON.stringify(folders))
        }
    }, [folders, hasMounted])

    // Save kahoots to localStorage when they change (only after mount)
    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("youknow_kahoots", JSON.stringify(kahoots))
        }
    }, [kahoots, hasMounted])

    // Save favorites to localStorage (only after mount)
    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("youknow_kahoot_favorites", JSON.stringify([...favoriteKahoots]))
        }
    }, [favoriteKahoots, hasMounted])

    // Create new Kahoot
    const handleCreateKahoot = () => {
        if (!newKahoot.title.trim()) return

        const kahoot: KahootType = {
            id: Date.now().toString(),
            title: newKahoot.title.trim(),
            description: newKahoot.description.trim(),
            color: newKahoot.color,
            questions: [],
            visibility: newKahoot.visibility,
            plays: 0,
            favorites: 0,
            players: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "draft",
            category: "General",
            language: "es",
            difficulty: "medium"
        }

        setKahoots([kahoot, ...kahoots])
        setNewKahoot({ title: "", description: "", color: "#46178f", visibility: "private" })
        setShowCreateKahootModal(false)
    }

    // Delete Kahoot
    const handleDeleteKahoot = (kahootId: string) => {
        setKahoots(kahoots.filter(k => k.id !== kahootId))
        setKahootMenuOpen(null)
    }

    // Duplicate Kahoot
    const handleDuplicateKahoot = (kahoot: KahootType) => {
        const duplicate: KahootType = {
            ...kahoot,
            id: Date.now().toString(),
            title: `${kahoot.title} (copia)`,
            plays: 0,
            favorites: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "draft"
        }
        setKahoots([duplicate, ...kahoots])
        setKahootMenuOpen(null)
    }

    // Toggle favorite
    const handleToggleFavorite = (kahootId: string) => {
        const newFavorites = new Set(favoriteKahoots)
        if (newFavorites.has(kahootId)) {
            newFavorites.delete(kahootId)
        } else {
            newFavorites.add(kahootId)
        }
        setFavoriteKahoots(newFavorites)
    }

    // Publish/Unpublish Kahoot
    const handleTogglePublish = (kahootId: string) => {
        setKahoots(kahoots.map(k => {
            if (k.id === kahootId) {
                return {
                    ...k,
                    status: k.status === "published" ? "draft" : "published",
                    updatedAt: new Date().toISOString()
                }
            }
            return k
        }))
        setKahootMenuOpen(null)
    }

    // Filter kahoots based on tab
    const filteredKahoots = useMemo(() => {
        let result = [...kahoots]

        switch (kahootTab) {
            case "drafts":
                result = result.filter(k => k.status === "draft")
                break
            case "published":
                result = result.filter(k => k.status === "published")
                break
            case "favorites":
                result = result.filter(k => favoriteKahoots.has(k.id))
                break
        }

        // Apply search
        if (searchQuery) {
            result = result.filter(k =>
                k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                k.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply sorting
        switch (sortBy) {
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                break
            case "alphabetical":
                result.sort((a, b) => a.title.localeCompare(b.title))
                break
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
        }

        return result
    }, [kahoots, kahootTab, searchQuery, sortBy, favoriteKahoots])

    // Create new folder
    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: newFolderName.trim(),
            color: newFolderColor,
            courseIds: [],
            kahootIds: [],
        }

        setFolders([...folders, newFolder])
        setNewFolderName("")
        setNewFolderColor("#46178f")
        setShowCreateFolderModal(false)
    }

    // Delete folder
    const handleDeleteFolder = (folderId: string) => {
        setFolders(folders.filter((f) => f.id !== folderId))
        if (selectedFolderId === folderId) {
            setSelectedFolderId(null)
            setActiveSection("courses")
        }
    }

    // Drag and drop handlers for courses
    const handleDragStart = (courseId: string) => {
        setDraggedCourseId(courseId)
        setDraggedKahootId(null)
    }

    // Drag and drop handlers for kahoots
    const handleKahootDragStart = (kahootId: string) => {
        setDraggedKahootId(kahootId)
        setDraggedCourseId(null)
    }

    const handleDragEnd = () => {
        setDraggedCourseId(null)
        setDraggedKahootId(null)
        setDragOverFolderId(null)
    }

    const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
        e.preventDefault()
        setDragOverFolderId(folderId)
    }

    const handleDragLeaveFolder = () => {
        setDragOverFolderId(null)
    }

    const handleDropOnFolder = (folderId: string) => {
        if (!draggedCourseId && !draggedKahootId) return

        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                // Add course to folder if dragging a course
                if (draggedCourseId && !folder.courseIds.includes(draggedCourseId)) {
                    return {
                        ...folder,
                        courseIds: [...folder.courseIds, draggedCourseId]
                    }
                }
                // Add kahoot to folder if dragging a kahoot
                if (draggedKahootId && !folder.kahootIds.includes(draggedKahootId)) {
                    return {
                        ...folder,
                        kahootIds: [...folder.kahootIds, draggedKahootId]
                    }
                }
            }
            return folder
        }))

        setDraggedCourseId(null)
        setDraggedKahootId(null)
        setDragOverFolderId(null)
    }

    // Remove course from folder
    const handleRemoveFromFolder = (folderId: string, courseId: string) => {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                return {
                    ...folder,
                    courseIds: folder.courseIds.filter(id => id !== courseId)
                }
            }
            return folder
        }))
    }

    // Remove kahoot from folder
    const handleRemoveKahootFromFolder = (folderId: string, kahootId: string) => {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                return {
                    ...folder,
                    kahootIds: folder.kahootIds.filter(id => id !== kahootId)
                }
            }
            return folder
        }))
    }

    // Get courses in selected folder
    const getCoursesInFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId)
        if (!folder) return []

        return allCourses
            .filter(course => folder.courseIds.includes(course.id))
            .map(course => {
                const enrollment = user.enrollments.find((e: any) => e.course.id === course.id)
                return {
                    ...course,
                    enrollment: enrollment || null,
                    isEnrolled: !!enrollment,
                }
            })
    }

    // Get kahoots in selected folder
    const getKahootsInFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId)
        if (!folder) return []
        return kahoots.filter(kahoot => folder.kahootIds?.includes(kahoot.id))
    }

    // Get total item count in folder (courses + kahoots)
    const getFolderItemCount = (folder: FolderType) => {
        const courseCount = folder.courseIds.filter(id => allCourses.some(c => c.id === id)).length
        const kahootCount = (folder.kahootIds || []).filter(id => kahoots.some(k => k.id === id)).length
        return courseCount + kahootCount
    }

    // Clean up orphaned course IDs from folders
    const cleanupOrphanedCourses = () => {
        const validCourseIds = new Set(allCourses.map(c => c.id))
        setFolders(folders.map(folder => ({
            ...folder,
            courseIds: folder.courseIds.filter(id => validCourseIds.has(id))
        })))
    }

    // Sections for left sidebar
    const sections = [
        { id: "kahoots" as SectionType, label: t.library.sections.kahoots, icon: Sparkles, count: kahoots.length },
        { id: "stories" as SectionType, label: t.library.sections.stories, icon: BookMarked, count: 0 },
        { id: "courses" as SectionType, label: t.library.sections.courses, icon: Layers, count: allCourses.length },
        { id: "purchased" as SectionType, label: t.library.sections.purchased, icon: ShoppingBag, count: 0 },
    ]

    // Kahoot tabs configuration
    const kahootTabs = [
        { id: "all" as KahootTabType, label: "Todos", count: kahoots.length },
        { id: "drafts" as KahootTabType, label: "Borradores", count: kahoots.filter(k => k.status === "draft").length },
        { id: "published" as KahootTabType, label: "Publicados", count: kahoots.filter(k => k.status === "published").length },
        { id: "favorites" as KahootTabType, label: "Favoritos", count: [...favoriteKahoots].filter(id => kahoots.some(k => k.id === id)).length },
    ]

    // Filter and process courses based on active tab
    const filteredCourses = useMemo(() => {
        // Only show courses when in courses section
        if (activeSection !== "courses") return []

        let courses: any[] = []

        switch (activeTab) {
            case "enrolled":
                courses = user.enrollments
                    .filter((e: any) => e.progressPercent < 100)
                    .map((e: any) => ({
                        ...e.course,
                        enrollment: e,
                        isEnrolled: true,
                    }))
                break
            case "completed":
                courses = user.enrollments
                    .filter((e: any) => e.progressPercent === 100)
                    .map((e: any) => ({
                        ...e.course,
                        enrollment: e,
                        isEnrolled: true,
                    }))
                break
            case "recent":
                courses = user.enrollments
                    .slice(0, 10)
                    .map((e: any) => ({
                        ...e.course,
                        enrollment: e,
                        isEnrolled: true,
                    }))
                break
            case "favorites":
                courses = user.enrollments
                    .slice(0, 5)
                    .map((e: any) => ({
                        ...e.course,
                        enrollment: e,
                        isEnrolled: true,
                    }))
                break
            case "all":
            default:
                courses = allCourses.map((course) => {
                    const enrollment = user.enrollments.find((e: any) => e.course.id === course.id)
                    return {
                        ...course,
                        enrollment: enrollment || null,
                        isEnrolled: !!enrollment,
                    }
                })
                break
        }

        // Apply search filter
        if (searchQuery) {
            courses = courses.filter(
                (course) =>
                    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply sorting
        switch (sortBy) {
            case "oldest":
                courses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                break
            case "alphabetical":
                courses.sort((a, b) => a.title.localeCompare(b.title))
                break
            case "progress":
                courses.sort((a, b) => (b.enrollment?.progressPercent || 0) - (a.enrollment?.progressPercent || 0))
                break
            case "newest":
            default:
                courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
        }

        return courses
    }, [activeSection, activeTab, user.enrollments, allCourses, searchQuery, sortBy])

    // Count total lessons in a course
    const getLessonCount = (course: any) => {
        if (!course.modules) return 0
        return course.modules.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0)
    }

    // Tabs configuration
    const tabs = [
        { id: "all" as TabType, label: t.library.tabs.all, count: allCourses.length },
        { id: "enrolled" as TabType, label: t.library.tabs.enrolled, count: user.enrollments.filter((e: any) => e.progressPercent < 100).length },
        { id: "completed" as TabType, label: t.library.tabs.completed, count: user.enrollments.filter((e: any) => e.progressPercent === 100).length },
        { id: "recent" as TabType, label: t.library.tabs.recent, count: Math.min(user.enrollments.length, 10) },
        { id: "favorites" as TabType, label: t.library.tabs.favorites, count: Math.min(user.enrollments.length, 5) },
    ]

    // Get empty state message based on section
    const getEmptyState = () => {
        switch (activeSection) {
            case "kahoots":
                return { title: "Sin Knows", subtitle: "Crea tu primer Know para verlo aquí" }
            case "stories":
                return { title: "Sin Historias", subtitle: "Crea tu primera historia para verla aquí" }
            case "purchased":
                return { title: "Sin contenido comprado", subtitle: "El contenido que compres aparecerá aquí" }
            case "trash":
                return { title: t.library.trash.empty, subtitle: t.library.trash.emptyAction }
            case "folder":
                return { title: "Carpeta vacía", subtitle: "Arrastra cursos aquí para organizarlos" }
            default:
                return { title: t.library.empty.title, subtitle: t.library.empty.subtitle }
        }
    }

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#121212]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px] flex">
                {/* Library Left Sidebar - Kahoot Style */}
                <aside className="w-64 min-h-[calc(100vh-64px)] bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="p-4">
                        {/* Create Button - Solo para creadores o superior */}
                        {isCreator(user.role) && (
                            <Link href="/creador/create">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#26890c] text-white font-bold hover:bg-[#2ea00f] transition-all hover:scale-[1.02] shadow-lg mb-6">
                                    <Plus className="h-5 w-5" />
                                    Crear
                                </button>
                            </Link>
                        )}

                        {/* Main Sections */}
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon
                                const isActive = activeSection === section.id
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-[#46178f]/10 text-[#46178f]"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? "text-[#46178f]" : "text-gray-500"}`} />
                                        <span className="flex-1 text-left">{section.label}</span>
                                        {section.count > 0 && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                isActive ? "bg-[#46178f]/20 text-[#46178f]" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                                            }`}>
                                                {section.count}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </nav>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                        {/* Folders Section */}
                        <div>
                            <button
                                onClick={() => setExpandedFolders(!expandedFolders)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ChevronRight className={`h-4 w-4 transition-transform ${expandedFolders ? "rotate-90" : ""}`} />
                                {t.library.folders.title}
                            </button>

                            {expandedFolders && (
                                <div className="mt-1 space-y-1">
                                    {folders.length > 0 ? (
                                        folders.map((folder) => (
                                            <div
                                                key={folder.id}
                                                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                                                    dragOverFolderId === folder.id
                                                        ? "bg-[#26890c]/20 ring-2 ring-[#26890c] ring-inset"
                                                        : selectedFolderId === folder.id
                                                        ? "bg-[#46178f]/10 text-[#46178f]"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                                onClick={() => setSelectedFolderId(folder.id)}
                                                onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                                                onDragLeave={handleDragLeaveFolder}
                                                onDrop={() => handleDropOnFolder(folder.id)}
                                            >
                                                <Folder className="h-4 w-4" style={{ color: folder.color }} />
                                                <span className="flex-1 text-left truncate">{folder.name}</span>
                                                <span className="text-xs text-gray-400 group-hover:hidden">{getFolderItemCount(folder)}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteFolder(folder.id)
                                                    }}
                                                    className="hidden group-hover:flex h-6 w-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 items-center justify-center"
                                                >
                                                    <X className="h-3.5 w-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-xs text-gray-400 italic">
                                            {t.library.folders.empty}
                                        </p>
                                    )}

                                    {/* Create Folder Button */}
                                    <button
                                        onClick={() => setShowCreateFolderModal(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <FolderPlus className="h-4 w-4" />
                                        <span>{t.library.folders.create}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                        {/* Trash */}
                        <button
                            onClick={() => setActiveSection("trash")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeSection === "trash"
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <Trash2 className={`h-5 w-5 ${activeSection === "trash" ? "text-red-500" : "text-gray-500"}`} />
                            <span>{t.library.trash.title}</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1">
                    <DashboardHeader user={user} />

                    <main className="p-6">
                        {/* Section Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeSection === "courses" && t.library.sections.courses}
                                {activeSection === "kahoots" && t.library.sections.kahoots}
                                {activeSection === "stories" && t.library.sections.stories}
                                {activeSection === "purchased" && t.library.sections.purchased}
                                {activeSection === "trash" && t.library.trash.title}
                                {activeSection === "folder" && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedFolderId(null)
                                                setActiveSection("courses")
                                            }}
                                            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                                        >
                                            <ChevronRight className="h-5 w-5 rotate-180 text-gray-500" />
                                        </button>
                                        <Folder
                                            className="h-6 w-6"
                                            style={{ color: folders.find(f => f.id === selectedFolderId)?.color || "#46178f" }}
                                        />
                                        <span>{folders.find(f => f.id === selectedFolderId)?.name || "Carpeta"}</span>
                                    </div>
                                )}
                            </h1>
                        </div>

                        {/* Tabs - Only show for courses section */}
                        {activeSection === "courses" && (
                            <div className="flex items-center gap-1 bg-white dark:bg-[#1e1e1e] rounded-xl p-1.5 shadow-sm overflow-x-auto mb-6">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                                isActive
                                                    ? "bg-[#46178f] text-white shadow-md"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {tab.label}
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs ${
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Kahoot Tabs and Create Button */}
                        {activeSection === "kahoots" && (
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-1 bg-white dark:bg-[#1e1e1e] rounded-xl p-1.5 shadow-sm overflow-x-auto">
                                    {kahootTabs.map((tab) => {
                                        const isActive = kahootTab === tab.id
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setKahootTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                                    isActive
                                                        ? "bg-[#46178f] text-white shadow-md"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {tab.label}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                                        isActive
                                                            ? "bg-white/20 text-white"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                                    }`}
                                                >
                                                    {tab.count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                                {isCreator(user.role) && (
                                    <button
                                        onClick={() => setShowCreateKahootModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#26890c] text-white font-bold hover:bg-[#2ea00f] transition-all hover:scale-[1.02] shadow-lg"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Crear Kahoot
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Search and Filters Bar */}
                        <div className="flex items-center gap-3 mb-6">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t.library.search}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#1e1e1e] border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#46178f] shadow-sm"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="flex items-center gap-2 h-12 px-4 rounded-xl bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Filter className="h-4 w-4" />
                                    {t.library.filters.sortBy}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                                </button>
                                {showSortMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-20">
                                        {[
                                            { id: "newest" as SortType, label: t.library.filters.newest },
                                            { id: "oldest" as SortType, label: t.library.filters.oldest },
                                            { id: "alphabetical" as SortType, label: t.library.filters.alphabetical },
                                            { id: "progress" as SortType, label: t.library.filters.progress },
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setSortBy(option.id)
                                                    setShowSortMenu(false)
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    sortBy === option.id
                                                        ? "bg-[#46178f]/10 text-[#46178f] font-medium"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center bg-white dark:bg-[#1e1e1e] rounded-xl p-1 shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2.5 rounded-lg transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-[#46178f] text-white"
                                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Grid3X3 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2.5 rounded-lg transition-colors ${
                                        viewMode === "list"
                                            ? "bg-[#46178f] text-white"
                                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Results Count */}
                        {activeSection === "courses" && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    {filteredCourses.length} {filteredCourses.length === 1 ? t.library.item : t.library.items}
                                    {folders.length > 0 && (
                                        <span className="ml-2 text-[#46178f]">
                                            • Arrastra los cursos a una carpeta para organizarlos
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Knows Results Count */}
                        {activeSection === "kahoots" && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    {filteredKahoots.length} {filteredKahoots.length === 1 ? "know" : "knows"}
                                </p>
                            </div>
                        )}

                        {/* Knows Content Area */}
                        {activeSection === "kahoots" && (
                            <>
                                {filteredKahoots.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {filteredKahoots.map((kahoot, index) => (
                                            <KahootCard
                                                key={kahoot.id}
                                                kahoot={kahoot}
                                                isFavorite={favoriteKahoots.has(kahoot.id)}
                                                menuOpen={kahootMenuOpen === kahoot.id}
                                                onMenuToggle={() => setKahootMenuOpen(kahootMenuOpen === kahoot.id ? null : kahoot.id)}
                                                onToggleFavorite={() => handleToggleFavorite(kahoot.id)}
                                                onDuplicate={() => handleDuplicateKahoot(kahoot)}
                                                onDelete={() => handleDeleteKahoot(kahoot.id)}
                                                onTogglePublish={() => handleTogglePublish(kahoot.id)}
                                                onDragStart={() => handleKahootDragStart(kahoot.id)}
                                                onDragEnd={handleDragEnd}
                                                isDragging={draggedKahootId === kahoot.id}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-12 text-center">
                                        <div className="h-20 w-20 rounded-full bg-[#46178f]/10 flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="h-10 w-10 text-[#46178f]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {kahootTab === "favorites" ? "Sin favoritos" : kahootTab === "drafts" ? "Sin borradores" : kahootTab === "published" ? "Sin publicados" : "Sin Knows"}
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            {kahootTab === "favorites" ? "Marca knows como favoritos para verlos aquí" : "Crea tu primer Know interactivo"}
                                        </p>
                                        {kahootTab !== "favorites" && isCreator(user.role) && (
                                            <button
                                                onClick={() => setShowCreateKahootModal(true)}
                                                className="px-6 py-3 rounded-full bg-[#26890c] text-white font-bold hover:bg-[#2ea00f] transition-colors"
                                            >
                                                <Plus className="h-5 w-5 inline mr-2" />
                                                Crear Kahoot
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Folder Content Area */}
                        {activeSection === "folder" && selectedFolderId && (
                            <>
                                {!hasMounted ? (
                                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-12 text-center">
                                        <div className="animate-pulse">
                                            <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
                                            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
                                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                                        </div>
                                    </div>
                                ) : (getCoursesInFolder(selectedFolderId).length > 0 || getKahootsInFolder(selectedFolderId).length > 0) ? (
                                    <div className="space-y-6">
                                        {/* Knows in Folder */}
                                        {getKahootsInFolder(selectedFolderId).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4" />
                                                    Knows ({getKahootsInFolder(selectedFolderId).length})
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                    {getKahootsInFolder(selectedFolderId).map((kahoot) => (
                                                        <KahootCard
                                                            key={kahoot.id}
                                                            kahoot={kahoot}
                                                            isFavorite={favoriteKahoots.has(kahoot.id)}
                                                            menuOpen={kahootMenuOpen === kahoot.id}
                                                            onMenuToggle={() => setKahootMenuOpen(kahootMenuOpen === kahoot.id ? null : kahoot.id)}
                                                            onToggleFavorite={() => handleToggleFavorite(kahoot.id)}
                                                            onDuplicate={() => handleDuplicateKahoot(kahoot)}
                                                            onDelete={() => handleDeleteKahoot(kahoot.id)}
                                                            onTogglePublish={() => handleTogglePublish(kahoot.id)}
                                                            showRemoveButton={true}
                                                            onRemove={() => handleRemoveKahootFromFolder(selectedFolderId, kahoot.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Courses in Folder */}
                                        {getCoursesInFolder(selectedFolderId).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Layers className="h-4 w-4" />
                                                    Cursos ({getCoursesInFolder(selectedFolderId).length})
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                    {getCoursesInFolder(selectedFolderId).map((course, index) => (
                                                        <CourseCard
                                                            key={course.id}
                                                            course={course}
                                                            color={getColor(index)}
                                                            lessonCount={getLessonCount(course)}
                                                            t={t}
                                                            showRemoveButton={true}
                                                            onRemove={() => handleRemoveFromFolder(selectedFolderId, course.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <EmptyState
                                        section={activeSection}
                                        emptyState={getEmptyState()}
                                        t={t}
                                        userRole={user.role}
                                    />
                                )}
                            </>
                        )}

                        {/* Content Area */}
                        {activeSection === "courses" && filteredCourses.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filteredCourses.map((course, index) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            color={getColor(index)}
                                            lessonCount={getLessonCount(course)}
                                            t={t}
                                            onDragStart={() => handleDragStart(course.id)}
                                            onDragEnd={handleDragEnd}
                                            isDragging={draggedCourseId === course.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredCourses.map((course, index) => (
                                        <CourseListItem
                                            key={course.id}
                                            course={course}
                                            color={getColor(index)}
                                            lessonCount={getLessonCount(course)}
                                            t={t}
                                            onDragStart={() => handleDragStart(course.id)}
                                            onDragEnd={handleDragEnd}
                                            isDragging={draggedCourseId === course.id}
                                        />
                                    ))}
                                </div>
                            )
                        ) : activeSection === "courses" ? (
                            <EmptyState
                                section={activeSection}
                                emptyState={getEmptyState()}
                                t={t}
                                userRole={user.role}
                            />
                        ) : activeSection !== "folder" && (
                            <EmptyState
                                section={activeSection}
                                emptyState={getEmptyState()}
                                t={t}
                                userRole={user.role}
                            />
                        )}
                    </main>
                </div>
            </div>

            {/* Create Folder Modal */}
            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t.library.folders.newFolder}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateFolderModal(false)
                                    setNewFolderName("")
                                    setNewFolderColor("#46178f")
                                }}
                                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Folder Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t.library.folders.folderName}
                            </label>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder={t.library.folders.folderNamePlaceholder}
                                className="w-full h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Color Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t.library.folders.selectColor}
                            </label>
                            <div className="flex items-center gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewFolderColor(color)}
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                            newFolderColor === color
                                                ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#1e1e1e]"
                                                : ""
                                        }`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {newFolderColor === color && (
                                            <Check className="h-5 w-5 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-2">Vista previa</p>
                            <div className="flex items-center gap-3">
                                <Folder className="h-5 w-5" style={{ color: newFolderColor }} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {newFolderName || "Mi carpeta"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateFolderModal(false)
                                    setNewFolderName("")
                                    setNewFolderColor("#46178f")
                                }}
                                className="flex-1 h-12 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t.library.folders.cancelButton}
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim()}
                                className={`flex-1 h-12 rounded-xl font-bold text-white transition-all ${
                                    newFolderName.trim()
                                        ? "bg-[#26890c] hover:bg-[#2ea00f] hover:scale-[1.02]"
                                        : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                }`}
                            >
                                {t.library.folders.createButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Kahoot Modal */}
            {showCreateKahootModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-lg p-6 shadow-2xl mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Crear nuevo Kahoot
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateKahootModal(false)
                                    setNewKahoot({ title: "", description: "", color: "#46178f", visibility: "private" })
                                }}
                                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Title Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del Kahoot *
                            </label>
                            <input
                                type="text"
                                value={newKahoot.title}
                                onChange={(e) => setNewKahoot({ ...newKahoot, title: e.target.value })}
                                placeholder="Ej: Quiz de Matemáticas"
                                className="w-full h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Description Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea
                                value={newKahoot.description}
                                onChange={(e) => setNewKahoot({ ...newKahoot, description: e.target.value })}
                                placeholder="Describe tu Kahoot..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all resize-none"
                            />
                        </div>

                        {/* Color Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color de portada
                            </label>
                            <div className="flex items-center gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewKahoot({ ...newKahoot, color })}
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                            newKahoot.color === color
                                                ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#1e1e1e]"
                                                : ""
                                        }`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {newKahoot.color === color && (
                                            <Check className="h-5 w-5 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Visibilidad
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "private", label: "Privado", icon: "🔒" },
                                    { id: "organization", label: "Organización", icon: "🏢" },
                                    { id: "public", label: "Público", icon: "🌎" },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setNewKahoot({ ...newKahoot, visibility: option.id as any })}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                                            newKahoot.visibility === option.id
                                                ? "bg-[#46178f] text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <span className="text-lg">{option.icon}</span>
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                            <div className="h-20 flex items-center justify-center" style={{ backgroundColor: newKahoot.color }}>
                                <Sparkles className="h-8 w-8 text-white/50" />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800">
                                <p className="font-bold text-gray-900 dark:text-white truncate">
                                    {newKahoot.title || "Título del Kahoot"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {newKahoot.description || "Sin descripción"}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateKahootModal(false)
                                    setNewKahoot({ title: "", description: "", color: "#46178f", visibility: "private" })
                                }}
                                className="flex-1 h-12 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateKahoot}
                                disabled={!newKahoot.title.trim()}
                                className={`flex-1 h-12 rounded-xl font-bold text-white transition-all ${
                                    newKahoot.title.trim()
                                        ? "bg-[#26890c] hover:bg-[#2ea00f] hover:scale-[1.02]"
                                        : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                }`}
                            >
                                Crear Kahoot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Kahoot Card Component
function KahootCard({
    kahoot,
    isFavorite,
    menuOpen,
    onMenuToggle,
    onToggleFavorite,
    onDuplicate,
    onDelete,
    onTogglePublish,
    onDragStart,
    onDragEnd,
    isDragging,
    showRemoveButton,
    onRemove
}: {
    kahoot: KahootType
    isFavorite: boolean
    menuOpen: boolean
    onMenuToggle: () => void
    onToggleFavorite: () => void
    onDuplicate: () => void
    onDelete: () => void
    onTogglePublish: () => void
    onDragStart?: () => void
    onDragEnd?: () => void
    isDragging?: boolean
    showRemoveButton?: boolean
    onRemove?: () => void
}) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
    }

    return (
        <div
            draggable={!!onDragStart}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isDragging ? "opacity-50 scale-95" : ""}`}
        >
            {/* Color Header */}
            <div className="h-32 relative" style={{ backgroundColor: kahoot.color }}>
                {/* Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 right-2 w-16 h-16 border-4 border-white/30 rounded-full" />
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/20 rotate-45" />
                </div>

                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
                    kahoot.status === "published"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-black"
                }`}>
                    {kahoot.status === "published" ? "Publicado" : "Borrador"}
                </div>

                {/* Play Button Overlay */}
                <Link href={`/kahoot/${kahoot.id}/play`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                </Link>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite()
                    }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </button>

                {/* Questions Count */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-white text-xs">
                    <HelpCircle className="h-3 w-3" />
                    <span>{kahoot.questions.length} preguntas</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#46178f] transition-colors">
                        {kahoot.title}
                    </h3>
                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onMenuToggle()
                            }}
                            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                        >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onTogglePublish()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <Zap className="h-4 w-4" />
                                    {kahoot.status === "published" ? "Despublicar" : "Publicar"}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDuplicate()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <Copy className="h-4 w-4" />
                                    Duplicar
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <Share2 className="h-4 w-4" />
                                    Compartir
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <BarChart3 className="h-4 w-4" />
                                    Reportes
                                </button>
                                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {kahoot.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{kahoot.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <Play className="h-3.5 w-3.5" />
                        {kahoot.plays} jugadas
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {kahoot.favorites}
                    </span>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        {formatDate(kahoot.updatedAt)}
                    </span>
                    <div className="flex items-center gap-2">
                        {showRemoveButton && onRemove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onRemove()
                                }}
                                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                            >
                                <X className="h-3 w-3" />
                                Quitar
                            </button>
                        )}
                        <Link href={`/kahoot/${kahoot.id}/edit`}>
                            <button className="flex items-center gap-1 text-xs font-medium text-[#46178f] hover:underline">
                                <Edit3 className="h-3 w-3" />
                                Editar
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Empty State Component
function EmptyState({ section, emptyState, t, userRole }: { section: SectionType; emptyState: { title: string; subtitle: string }; t: any; userRole?: string }) {
    const icons: Record<SectionType, any> = {
        kahoots: Sparkles,
        stories: BookMarked,
        courses: Layers,
        purchased: ShoppingBag,
        folder: Folder,
        trash: Trash2,
    }
    const Icon = icons[section] || Folder

    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-12 text-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                section === "trash" ? "bg-red-50 dark:bg-red-900/20" : "bg-[#46178f]/10"
            }`}>
                <Icon className={`h-10 w-10 ${section === "trash" ? "text-red-400" : "text-[#46178f]"}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {emptyState.title}
            </h3>
            <p className="text-gray-500 mb-6">{emptyState.subtitle}</p>
            {section === "courses" && (
                <Link href="/discover">
                    <button className="px-6 py-3 rounded-full bg-[#46178f] text-white font-bold hover:bg-[#5a1eb5] transition-colors">
                        {t.library.empty.action}
                    </button>
                </Link>
            )}
            {(section === "kahoots" || section === "stories") && isCreator(userRole) && (
                <Link href="/creador/create">
                    <button className="px-6 py-3 rounded-full bg-[#26890c] text-white font-bold hover:bg-[#2ea00f] transition-colors">
                        <Plus className="h-5 w-5 inline mr-2" />
                        Crear
                    </button>
                </Link>
            )}
        </div>
    )
}

// Course Card Component - Kahoot Style
function CourseCard({
    course,
    color,
    lessonCount,
    t,
    onDragStart,
    onDragEnd,
    isDragging,
    showRemoveButton,
    onRemove
}: {
    course: any
    color: string
    lessonCount: number
    t: any
    onDragStart?: () => void
    onDragEnd?: () => void
    isDragging?: boolean
    showRemoveButton?: boolean
    onRemove?: () => void
}) {
    const progress = course.enrollment?.progressPercent || 0
    const isCompleted = progress === 100
    const isEnrolled = course.isEnrolled

    return (
        <div
            draggable={!!onDragStart}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`${isDragging ? "opacity-50 scale-95" : ""} transition-all`}
        >
            <Link href={isEnrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`}>
                <div className="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-grab active:cursor-grabbing">
                {/* Color Header */}
                <div className="h-32 relative" style={{ backgroundColor: color }}>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-2 left-2 w-8 h-8 border-4 border-white/50 rounded-lg rotate-12" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-4 border-white/50 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-white/30 rotate-45" />
                    </div>

                    {/* Course Initial */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-black text-white/30">{course.title.charAt(0)}</span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-6 w-6 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                    </div>

                    {/* Status Badge */}
                    {isCompleted && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#26890c] text-xs font-bold">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {t.library.card.completed}
                        </div>
                    )}
                    {isEnrolled && !isCompleted && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 text-gray-700 text-xs font-bold">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {progress}%
                        </div>
                    )}

                    {/* Progress Bar */}
                    {isEnrolled && progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {/* More Options / Remove from folder button */}
                    {showRemoveButton && onRemove ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onRemove()
                            }}
                            className="absolute top-3 left-3 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Quitar de la carpeta"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => e.preventDefault()}
                            className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-[#46178f] transition-colors">
                        {course.title}
                    </h3>
                    {course.subtitle && (
                        <p className="text-sm text-gray-500 line-clamp-1 mb-3">{course.subtitle}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {lessonCount} {t.library.card.lessons}
                            </span>
                            {course._count?.enrollments > 0 && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {course._count.enrollments}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Instructor */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <div
                            className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: color }}
                        >
                            {course.instructor?.name?.charAt(0) || "?"}
                        </div>
                        <span className="text-xs text-gray-500 truncate">
                            {t.library.card.by} {course.instructor?.name || "Unknown"}
                        </span>
                    </div>
                </div>
                </div>
            </Link>
        </div>
    )
}

// Course List Item Component - Kahoot Style
function CourseListItem({
    course,
    color,
    lessonCount,
    t,
    onDragStart,
    onDragEnd,
    isDragging
}: {
    course: any
    color: string
    lessonCount: number
    t: any
    onDragStart?: () => void
    onDragEnd?: () => void
    isDragging?: boolean
}) {
    const progress = course.enrollment?.progressPercent || 0
    const isCompleted = progress === 100
    const isEnrolled = course.isEnrolled

    return (
        <div
            draggable={!!onDragStart}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`${isDragging ? "opacity-50 scale-95" : ""} transition-all`}
        >
            <Link href={isEnrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`}>
                <div className="group bg-white dark:bg-[#1e1e1e] rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                {/* Color Thumbnail */}
                <div
                    className="h-16 w-20 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: color }}
                >
                    <span className="text-2xl font-black text-white/40">{course.title.charAt(0)}</span>
                    {isEnrolled && progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-[#46178f] transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {t.library.card.by} {course.instructor?.name || "Unknown"}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isCompleted ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#26890c]/10 text-[#26890c] text-xs font-bold">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    {t.library.card.completed}
                                </span>
                            ) : isEnrolled ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1368ce]/10 text-[#1368ce] text-xs font-bold">
                                    {progress}% {t.library.card.progress}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {lessonCount} {t.library.card.lessons}
                        </span>
                        {course._count?.enrollments > 0 && (
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {course._count.enrollments}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.level}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: color, color: "white" }}
                >
                    {isEnrolled ? (isCompleted ? t.common.view : t.library.card.continue) : t.library.card.start}
                </button>
            </div>
            </Link>
        </div>
    )
}
