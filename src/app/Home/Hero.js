'use client'
import { useState, useCallback, useEffect } from 'react'
import { Col, Row, Typography, Button, Table, Tag, Modal, Input, Drawer } from "antd"
import styles from '@/app/page.module.css'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { collection, getDocs } from 'firebase/firestore/lite';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { firestore, storage } from '@/config/firebase';
import Image from 'next/image';
const { Title, Text } = Typography;

const RandomId = () => Math.random().toString(36).slice(2)

export default function page() {

  // This is the Model State and Function

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };


  // State of show the Project

  const [documents, setDocuments] = useState([]);
  const [project, setProject] = useState({})

  const getProjects = useCallback(async () => {
    let array = []
    setProcessing(true)
    try {
      const querySnapshot = await getDocs(collection(firestore, "projects"));
      querySnapshot.forEach((doc) => {
        if (doc.data()) {
          let data = doc.data()
          data.key = data.id
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
      setProcessing(false)
    } catch (error) {
      console.log('error :>> ', error);
    }
  }, [])

  useEffect(() => {
    getProjects()
  }, [getProjects])


  console.log(documents)

  // This is State of get Vaue and Function
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
      status: "CHECKED IN",
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
      setIsModalOpen(false)
      alert("A new Project has been successfullfy added")
    } catch (error) {
      console.log(error)
      alert("Something went wrong. Please try again")
    }
    setProcessing(false)

  }

  console.log('project', project)


  // This is Table of Project 
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      render: (row, item) => <a onClick={() => { setProject(item); showDrawer() }}>{item.name}</a>
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      render: (row, item) => <>{item.createdBy.fullName}</>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text) => <><Tag color="success">{text}</Tag></>
    },
    {
      title: 'Created',
      dataIndex: 'date'
    },

  ];
  const data = [
    {
      key: '1',
      name: 'John Brown',
      owner: 'Hasnat Majid',
      status: 'CHECKED IN',
      created: '12th jun 2023',
    },

  ];

  return (
    <div className={styles.TOP_MAIN}>

      <Row>
        <Col span={22}>
          <Title level={2} style={{ margin: '0px' }}>CheckIns</Title>
          <Text style={{ margin: "0px" }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</Text>
        </Col>
        <Col span={2}>
          <Button type="primary" style={{ background: "black", marginTop: '25px', borderRadius: 0 }} onClick={() => setIsModalOpen(true)} >Add Check In</Button>
          <Modal style={{ top: 230, }} title="New Checkin" open={isModalOpen} onOk={submit} okText='Create CheckIn' onCancel={() => setIsModalOpen(false)}>
            <div className={styles.INPUTS}>
              <Input placeholder='Check In Title' style={{ borderRadius: 0, marginBottom: "10px" }} onChange={handleChange} name='name' />
              <Input style={{ borderRadius: 0 }} onChange={handleFile} type='file' />
            </div>
          </Modal>
        </Col>
      </Row>

      <div className={styles.TABLE_SECTION}>
        <Table columns={columns} dataSource={documents} loading={processing} pagination={false} />
        <Drawer title="Details" placement="right" onClose={onClose} open={open}>
          <Title level={1}>{project.name}</Title>
          <Image src={project?.photo?.url} width={300} height={300} />
        </Drawer>
      </div>

    </div>
  )
}
