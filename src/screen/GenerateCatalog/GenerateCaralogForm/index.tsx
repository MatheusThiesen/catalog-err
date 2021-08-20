import React, { useRef, useCallback, memo, useState } from 'react'
import { FaFileDownload } from 'react-icons/fa'
import { FcOpenedFolder } from 'react-icons/fc'
import { FiAlertCircle } from 'react-icons/fi'
import { IoMdTrash } from 'react-icons/io'
import { MdArrowDownward } from 'react-icons/md'
import { RiFileExcel2Fill } from 'react-icons/ri'
import { useToggle } from 'react-use'

import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { ipcRenderer } from 'electron'
import filesize from 'filesize'
import * as Yup from 'yup'

import ButtonPartIcon from '../../../components/ButtonPartIcon'
import Dropzone from '../../../components/Dropzone'
import Input from '../../../components/Form/Input'
import Select from '../../../components/Form/Select'
import { useToast } from '../../../context/toast'
import getValidationErrors from '../../../utils/getValidationErrors'
import {
  ActionsContainer,
  InputGroup,
  DownloadFile,
  ContainerDropZone,
  ContainerPreviews,
  ErrorDropzone
} from './styles'

interface ConnectionFormData {
  template: string
  pathImages: string
  file: string
}

const GenerateCaralogForm: React.FC = () => {
  const formRef = useRef<FormHandles>(null)
  const { addToast } = useToast()

  // const [createConnectionLoading, toggleCreateConnectionLoading] = useToggle(
  //   false
  // )
  const [file, setFile] = useState<File | undefined>()
  const handleCreateOrUpdateConnection = useCallback(
    async (data: ConnectionFormData) => {
      try {
        formRef.current?.setErrors({})

        const schema = Yup.object().shape({
          template: Yup.string().required(),
          pathImages: Yup.string().required(),
          file: Yup.string().required()
        })

        // toggleCreateConnectionLoading()

        await schema.validate(data, {
          abortEarly: false
        })
        try {
          const { pathImages, template, file } = data
          ipcRenderer.send('generate-catalog', {
            template: template,
            pathImages: pathImages,
            pathFile: file
          })

          addToast({
            type: 'success',
            title: 'Catálago gerado com sucesso',
            description: '',
            notTimer: true
          })
        } catch (err) {
          addToast({
            type: 'error',
            title: 'Error saving connection',
            description: err.message || 'Unexpected error occurred, try again.'
          })
        }
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)

          formRef.current?.setErrors(errors)
        }
      } finally {
        // toggleCreateConnectionLoading()
      }
    },
    [addToast]
  )
  const selectDirectory = () => {
    ipcRenderer.send('select-dir', '')

    ipcRenderer.on('selected-dir', async (_event, arg) => {
      formRef.current?.setFieldValue('pathImages', arg)
      formRef.current?.setFieldError('pathImages', '')
    })
  }
  const downloadDefaultFile = () => {
    ipcRenderer.send('download-default-file', 'templete.xls')
  }

  return (
    <Form
      initialData={{
        template: '',
        pathImages: '',
        file: ''
      }}
      ref={formRef}
      onSubmit={handleCreateOrUpdateConnection}
    >
      <InputGroup>
        <Select name="template" label="Template">
          <option value=""></option>
          <option value="laMartina">La Martina</option>
          <option value="usPolo">US Polo</option>
        </Select>
        <Input name="pathImages" label="Caminho das Imagens" />
        <button
          className="btn-open-dir"
          type="button"
          onClick={selectDirectory}
        >
          <FcOpenedFolder />
        </button>
      </InputGroup>

      <Input name="file" notView={true} />

      <DownloadFile className="download-file">
        <button type="button" onClick={downloadDefaultFile}>
          Baixar planilha modelo
          <span>
            <RiFileExcel2Fill color="#207245" size={20} />
            <MdArrowDownward color="#207245" size={14} />
          </span>
        </button>
      </DownloadFile>
      <ContainerDropZone>
        <Dropzone
          accept={[
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ]}
          onFileUploaded={file => {
            formRef.current?.setFieldValue('file', file.path)
            formRef.current?.setFieldError('file', '')
            setFile(file)
          }}
        />
        {formRef.current?.getFieldError('file') && (
          <ErrorDropzone>
            <FiAlertCircle color="#E96379" size={22} />
            <span>Arquivo é obrigatório</span>
          </ErrorDropzone>
        )}

        <ContainerPreviews>
          {file && (
            <li key={`${file.name}`}>
              <RiFileExcel2Fill size={60} color="#207245" />
              <div className="fileInfo">
                <div>
                  <strong>{file.name}</strong>
                  <span>{filesize(file.size)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(undefined)
                    formRef.current?.setFieldValue('file', '')
                  }}
                >
                  <IoMdTrash size={30} />
                </button>
              </div>
            </li>
          )}
        </ContainerPreviews>
      </ContainerDropZone>

      <ActionsContainer>
        <ButtonPartIcon
          Icon={FaFileDownload}
          name="GERAR"
          color="opaque"
          type="submit"
        />
      </ActionsContainer>
    </Form>
  )
}

export default memo(GenerateCaralogForm)
