'use client'

import { useState, useCallback, useEffect } from 'react'
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { collection, getDocs } from 'firebase/firestore/lite';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { firestore, storage } from '@/config/firebase';
import dayjs from 'dayjs';
import Image from 'next/image';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
const styleDetails = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    // boxShadow: 24,
    p: 5,
};

const RandomId = () => Math.random().toString(36).slice(2)

const Hero = () => {

    // Add Project Moadel State
    const [openAdd, setOpenAdd] = useState(false);
    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => setOpenAdd(false);

    // Details Project Moadel State
    const [openDetails, setOpenDetails] = useState(false);
    const handleOpenDetails = () => setOpenDetails(true);
    const handleCloseDetails = () => setOpenDetails(false);

    // State of show the Project

    const [documents, setDocuments] = useState([]);
    const [project, setProject] = useState({})

    const getProjects = useCallback(async () => {
        let array = []
        try {
            const querySnapshot = await getDocs(collection(firestore, "projects"));
            querySnapshot.forEach((doc) => {
                if (doc.data()) {
                    let data = doc.data()
                    const dateCreated = doc.data().dateCreated;
                    let date = null;
                    if (dateCreated && dateCreated.seconds) {
                        date = new Date(dateCreated.seconds * 1000 + dateCreated.nanoseconds / 1000000);
                        data.date = date.toLocaleString();
                    }
                    // doc.data() is never undefined for query doc snapshots
                    array.push(data)
                }
            });
            setDocuments(array)
        } catch (error) {
            console.log('error :>> ', error);
        }
    }, [])

    useEffect(() => {
        getProjects()
    }, [getProjects])

    // State of Add the Projcet

    const [state, setState] = useState({ name: '' })
    const [file, setFile] = useState(null)
    const [processing, setProcessing] = useState(false)

    const handleChange = (e) => {
        setState(s => ({ ...s, [e.target.name]: e.target.value }))
    }

    const handleFile = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };


    const submit = () => {
        let { name } = state;
        name = name.trim()

        if (name.length < 3) { return alert("Please enter name correctly") }

        const formData = {
            name,
            status: "CHECK IN",
            id: RandomId(),
            dateCreated: serverTimestamp(),
            createdBy: {
                fullName: "Hasnat Majid"
            }
        }
        setProcessing(true)
        uploadPhoto(formData)
    }

    const uploadPhoto = (formData) => {
        const ext = file.name.split('.').pop()
        const pathwithFileName = `Todos/${formData.id}/images/photo.${ext}`

        const fileRef = ref(storage, pathwithFileName);

        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on("state_changed", (snapshot) => {
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

        },
            (error) => {
                console.error(error)
                window.toastify("Something went wrong while uploading photo.", "error")
                setIsLoading(false)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    let photo = { url: downloadURL, size: file.size }
                    createDocument({ ...formData, photo })
                });
            }
        )
    }

    const createDocument = async (formData) => {

        const docRef = doc(firestore, "projects", formData.id)
        try {
            await setDoc(docRef, formData)
            setProcessing(false)
            getProjects()
            setOpenAdd(false)
            alert("A new Project has been successfullfy added")
        } catch (error) {
            console.log(error)
            alert("Something went wrong. Please try again")
        }
        setProcessing(false)

    }

    return (
        <>
            <Container fixed>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3>Project Name</h3>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto ex.</p>
                    </div>
                    <div>
                        <Button variant="contained" onClick={handleOpenAdd} style={{ background: "black" }}>Add New Project</Button>
                        <Modal
                            open={openAdd}
                            onClose={handleCloseAdd}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">Add New Project</Typography>
                                <TextField style={{ width: "100%", marginTop: "20px" }} onChange={handleChange} id="outlined-basic" name='name' label="Project Name" variant="outlined" />
                                <TextField style={{ width: "100%", marginTop: "20px" }} onChange={handleFile} type='file' />

                                <Button variant="contained" style={{ background: "red", width: "20%", marginTop: "20px", marginLeft: "10px", float: 'right' }} onClick={handleCloseAdd}>Cancel</Button>
                                <Button variant="contained" style={{ background: "green", width: "50%", marginTop: "20px", float: 'right' }} disabled={processing} onClick={submit}>
                                    {processing
                                        ? "Loading"
                                        : "Create CheckIn"
                                    }
                                </Button>
                            </Box>
                        </Modal>
                    </div>
                </div>
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                    <Table sx={{ minWidth: 750 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Project Name</TableCell>
                                <TableCell align="center">Onwer</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Created </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {
                                documents.map((item, id) => {
                                    return (
                                        <TableRow key={id} onClick={(items) => { handleOpenDetails(); setProject(item) }}>
                                            <TableCell component="th" scope="row">{item.name}</TableCell>
                                            <TableCell align="center">{item?.createdBy.fullName}</TableCell>
                                            <TableCell align="center"><span style={{ background: "#37F297", padding: "10px", }}>{item.status}</span></TableCell>
                                            <TableCell align="center">{dayjs(item?.date).format("DD MMM YYYY")}</TableCell>
                                        </TableRow>

                                    )
                                })
                            }

                        </TableBody>

                    </Table>
                </TableContainer>
                <Modal
                    open={openDetails}
                    onClose={handleCloseDetails}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={styleDetails}>
                        <Typography id="modal-modal-title" variant="h6" component="h5">{project.name}</Typography>
                        <Image src={project?.photo?.url} width={500} height={500} />
                        <Button variant="contained" style={{ background: "red", width: "20%", marginTop: "20px", marginLeft: "10px", float: 'right' }} onClick={handleCloseDetails}>Close</Button>
                    </Box>
                </Modal>
            </Container >
        </>
    );
};

export default Hero